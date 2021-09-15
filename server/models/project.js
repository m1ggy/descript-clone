import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    files: {},
    owner: { type: String, required: true },
    transcribed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const project = mongoose.model('project', projectSchema);

export default project;
