const express = require('express');
const multer = require('../middleware/multer'); 
const Report = require('../models/Report');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const transporter = require('./mailer');
const router = express.Router();
const User= require('../models/user');

// POST create report (one image only)
router.post('/', authenticate, multer.single('image'), async (req, res) => {
  try {
    const { title, description, category, severity, location } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;
    console.log("hi");

    //saving the report to database
    const newReport = new Report({
      title,
      description,
      category,
      severity,
      location,
      image: imagePath,
      submittedBy: req.user._id,
    });

    const savedReport = await newReport.save();
    console.log("saving report");
    

    //send email to all admins
    console.log("before admin find");
    const admins = await User.find({ role: 'admin' });
    console.log("after admin find");
    const adminEmails = admins.map(admin => admin.email); 

    //send email using the user email as sender
    console.log('prepare send email');
    console.log(req.user.email);
    await transporter.sendMail({
      from: `"Fault Report System" <${process.env.EMAIL_USER}>`,
      to: [...adminEmails, req.user.email], 
      subject: `New Fault Report: ${newReport.title}`,
      html: `
        <h2>A new report has been submitted</h2>
        <p><strong>Title:</strong> ${newReport.title}</p>
        <p><strong>Description:</strong> ${newReport.description}</p>
        <p><strong>Category:</strong> ${newReport.category}</p>
        <p><strong>Severity:</strong> ${newReport.severity}</p>
        <p><strong>Location:</strong> ${newReport.location}</p>
        <p><strong>Submitted by:</strong> ${req.user.email}</p>

      `,
    });
    console.log("it tried.");
    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({ message: 'Failed to create report', error: error.message });
  }
});

// PATCH update report (one image only)
router.patch('/:id/update', authenticate, multer.single('image'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    // usrs cant change status after report get assigned
    if (report.status !== 'Submitted') {
      return res.status(400).json({ message: 'Report cannot be edited after being assigned.' });
    }
    if (report.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    const { title, description, category, severity, location } = req.body;
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    report.title = title;
    report.description = description;
    report.category = category;
    report.severity = severity;
    report.location = location;
    report.updatedAt = new Date();

    if (req.file) {
      const imagePath = `uploads/${req.file.filename}`;
      report.image = imagePath;
    }

    const updated = await report.save();
    res.json(updated);
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ message: 'Error updating report' });
  }
});

//For dashboard cards, handles display of info and filters based on role
router.get('/dashboard-summary', authenticate, async (req, res) => {
  try {
    let query = {};

    // General: reports *submitted by* user
    if (req.user.role === 'general') {
      query = { submittedBy: req.user._id };
    }

    // Technician: reports *assigned to* user
    else if (req.user.role === 'technician') {
      query = { assignedTo: req.user._id };
    }

    // Admin sees all so query remains {} :)

    const [total, submitted, assigned, inProgress, resolved] = await Promise.all([
      Report.countDocuments(query),
      Report.countDocuments({ ...query, status: 'Submitted' }),
      Report.countDocuments({ ...query, status: 'Assigned' }),
      Report.countDocuments({ ...query, status: 'In Progress' }),
      Report.countDocuments({ ...query, status: 'Resolved' }),
    ]);

    res.json({
      total,        // All reports in this user's context
      submitted,    // Only meaningful for general users
      assigned,     // Assigned to the user (or system-wide for admin)
      inProgress,
      resolved
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
});


// GET user’s own reports
router.get('/mine', authenticate, async (req, res) => {
  try {
    const myReports = await Report.find({ submittedBy: req.user.id })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json(myReports);
  } catch (err) {
    console.error('Error fetching user reports:', err);
    res.status(500).json({ message: 'Error fetching user reports' });
  }
});

// GET reports assigned to technician
router.get('/assigned/:userId', authenticate, async (req, res) => {
  try {
    const reports = await Report.find({ assignedTo: req.params.userId })
      .populate('assignedTo', 'name email')
      .populate('submittedBy', 'name email');
    res.json(reports);
  } catch (err) {
    console.error('Error fetching assigned reports:', err);
    res.status(500).json({ message: 'Error fetching assigned reports' });
  }
});

// GET a single report
router.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

// PATCH update report status (tech or admin only)
router.patch('/:id', authenticate, authorize('admin', 'technician'), async (req, res) => {
  try {
    const { status } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (
      req.user.role === 'technician' &&
      report.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    report.status = status;
    report.updatedAt = new Date();
    await report.save();

    res.json(report);
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ message: 'Error updating report status' });
  }
});

// DELETE a report (only owner or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if the user is the owner or an admin
    if (report.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await report.deleteOne();
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

// Admin-only routes
router.use(authorize('admin'));

// GET all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// PATCH assign technician
router.patch('/:id/assign', async (req, res) => {
  try {
    const { technicianId } = req.body;
    if (!technicianId) {
      return res.status(400).json({ message: 'Technician ID is required' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: technicianId,
        status: 'Assigned',
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(updatedReport);
  } catch (err) {
    console.error('Error assigning technician:', err);
    res.status(500).json({ message: 'Error assigning technician' });
  }
});

// GET unassigned reports
router.get('/unassigned', async (req, res) => {
  try {
    const reports = await Report.find({
      assignedTo: { $exists: false },
      status: 'Submitted'
    });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching unassigned reports:', err);
    res.status(500).json({ message: 'Error fetching unassigned reports' });
  }
});





module.exports = router;
