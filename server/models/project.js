import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    files: {},
    owner: { type: String, required: true },
  },
  { timestamps: true }
);

const project = mongoose.model('project', projectSchema);

export default project;
