import Project from '../models/Project.js';
import Product from '../models/Product.js';
import generateUniqueCode from '../utils/codeGenerator.js';
import uploadToCloudinary from '../utils/imageUpload.js';

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { projectName, description, totalProducts } = req.body;

    // Generate unique project code
    const projectCode = await generateUniqueCode(Project, 'projectCode');

    // Handle image upload
    let projectImage;
    if (req.file) {
      projectImage = await uploadToCloudinary(req.file.buffer, 'profit-tracker/projects');
    }

    const project = await Project.create({
      projectCode,
      projectName,
      description,
      projectImage,
      totalProducts: totalProducts || 0,
      createdBy: req.user._id
    });

    const populatedProject = await Project.findById(project._id).populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getAllProjects = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name or code
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single project with products
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email profileImage');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get all products for this project
    const products = await Product.find({ projectId: project._id })
      .populate('soldBy', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        project,
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const { projectName, description, totalProducts } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update fields
    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (totalProducts) project.totalProducts = totalProducts;

    // Handle image upload
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'profit-tracker/projects');
      project.projectImage = imageUrl;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete all products associated with this project
    await Product.deleteMany({ projectId: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated products deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark project as completed
// @route   PATCH /api/projects/:id/complete
// @access  Private
export const markProjectComplete = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.status = 'completed';
    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
