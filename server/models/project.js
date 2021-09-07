import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectname: { type: String, required: true },
    files: [{ type: String, createdAt: Date }],
    owner: { type: String, required: true },
  },
  { timestamps: true }
);

const project = mongoose.model('project', projectSchema);

export default project;
