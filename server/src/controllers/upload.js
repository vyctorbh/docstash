import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import File from '../models/file';
import User from '../models/user';
import units from '../util/units';

const upload = (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, '/../../tmp');

  form.on('file', (field, file) => {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    User.findOne({_id: req.user._id}, (err, user) => {
      if (err) return next(err);
      user.storage = user.storage + file.size;
      user.save(err => {
        if (err) return next(err);
      });
    });
    const fileInDb = new File();
    fileInDb.userId = req.user._id;
    fileInDb.name = file.name;
    fileInDb.type = file.type;
    fileInDb.size = units(file.size);
    fileInDb.save(err => {
      if (err) return next(err);
    });
  });

  form.on('error', (err) => {
    console.log('An error has occured: \n' + err);
  });
  form.on('end', () => {
    res.end('success');
  });

  form.parse(req);
}

export default upload;
