const mongoose = require("mongoose");
const File = require("./models/File");
const Folder = require("./models/Folder");

mongoose.connect("mongodb://admin:admin@localhost:27017", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 1.Insert a Folder/File at any level
const insertFolder = async (name, path = ",") => {
  if (path != "," && !(await Folder.exists({ path }))) {
    throw new Error("Folder does not exist");
  }
  const folder = new Folder({ name, path: `${path}${name},` });
  await folder.save();
};

const insertFile = async (name, extension, size, height, width, path = ",") => {
  if (path != "," && !(await Folder.exists({ path }))) {
    throw new Error("Folder does not exsist");
  }
  const file = new File({
    name,
    extension,
    size,
    height,
    width,
    path: `${path}${name}.${extension}`,
  });
  await file.save();
};

// 2.Get list of files reverse sorted by date

const getFiles = async () => {
  const files = await File.find({ $query: {}, $orderBy: { createdAt: -1 } });
  console.log(files);
};

// 3. Find total size of a folder

const getSize = async (path) => {
  const files = await File.aggregate([
    { $match: { path: new RegExp(`^${path}`) } },
    { $group: { _id: null, size: { $sum: "$size" } } },
  ]);
  console.log(files[0].size);
};

// 4. Delete a folder

const deleteFolder = async (path) => {
  await Folder.deleteMany({ path: new RegExp(`^${path}`) });
  await File.deleteMany({ path: new RegExp(`^${path}`) });
};

// 5. Search by filename

const getFileByName = async (name) => {
  const files = await File.find({ name });
  console.log(files);
};

// 6. Search by filename and file ext

const getFileByNameAndExt = async (name, extension) => {
  const files = await File.find({ name, extension });
  console.log(files);
};

// 7. Rename a folder

const renameFolder = async (path, newName) => {
  const folder = await Folder.findOne({ path });
  if (folder == null) throw new Error("Folder does not exist.");
  const parentPath = folder.path.substring(
    0,
    folder.path.length - folder.name.length - 1
  );
  const newPath = `${parentPath}${newName},`;
  const regex = new RegExp(`^${path}`);
  folder.name = newName;
  folder.path = newPath;
  await folder.save();
  const folders = await Folder.find({ path: regex });
  for (let folder of folders) {
    folder.path = folder.path.replace(regex, newPath);
    await folder.save();
  }
  const files = await File.find({ path: regex });
  for (let file of files) {
    file.path = file.path.replace(regex, newPath);
    await file.save();
  }
};

const initDB = async () => {
  await Folder.deleteMany({});
  await File.deleteMany({});
  await insertFolder("Folder1");
  await insertFolder("Folder2");
  await insertFolder("SubFolder1", ",Folder2,");
  await insertFolder("SubFolder2", ",Folder2,");
  await insertFile("File1", "png", 20, 100, 100, ",Folder1,");
  await insertFile("File2", "png", 100, 200, 200, ",Folder1,");
  await insertFile("File3", "jpg", 45, 100, 100, ",Folder2,SubFolder2,");
  await insertFile("File4", "txt", 6, null, null, ",Folder2,SubFolder2,");
  await getFiles();
  await getFileByName("File3");
  await getFileByNameAndExt("File4", "txt");
  await getSize(",Folder2,SubFolder2");
  await deleteFolder(",Folder1,");
  await renameFolder(",Folder2,", "newFolder2");
};

initDB().finally(() => {
  mongoose.connection.close();
});
