import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    files: {
      transcription: { type: Object },
      media: { type: Array },
      json: { type: Object },
    },
    owner: { type: String, required: true },
    transcribed: { type: Boolean, default: false },
    exported: { type: Boolean, default: false },
    exportedUrl: {},
  },
  { timestamps: true }
);

const project = mongoose.model('project', projectSchema);

export default project;
