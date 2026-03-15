const Record = require('../models/Record');

function formatRecord(record) {
  return {
    id: record._id.toString(),
    name: record.name,
    category: record.category,
    status: record.status,
    size: record.size,
    createdAt: record.createdAt,
  };
}

async function listRecords(req, res) {
  try {
    const records = await Record.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ records: records.map(formatRecord) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load records' });
  }
}

async function createRecord(req, res) {
  try {
    const { name, category, status, size } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Record name is required' });
    }

    const record = await Record.create({
      user: req.user._id,
      name: name.trim(),
      category: typeof category === 'string' && category.trim() ? category.trim() : 'General',
      status: status === 'Processing' || status === 'Verified' ? status : 'Uploaded',
      size: typeof size === 'number' ? size : 0,
    });

    return res.status(201).json({ record: formatRecord(record) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create record' });
  }
}

async function deleteRecord(req, res) {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete record' });
  }
}

module.exports = { listRecords, createRecord, deleteRecord };
