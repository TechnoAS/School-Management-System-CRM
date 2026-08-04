import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String }
});
const Course = mongoose.model('Course', courseSchema);

const studentSchema = new mongoose.Schema({
  id: { type: String },
  course_id: { type: String } // no ref
});
studentSchema.virtual('course', {
  ref: 'Course',
  localField: 'course_id',
  foreignField: 'id',
  justOne: true
});
// Need this to ensure virtuals are populated when using lean? 
// No, lean().populate() requires mongoose-lean-virtuals OR in Mongoose 6+ it just works if you specify it. Wait, let's test.
const Student = mongoose.model('Student', studentSchema);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/school_crm_test');
  await Course.deleteMany({});
  await Student.deleteMany({});

  await Course.create({ id: 'C1', name: 'Math' });
  await Student.create({ id: 'S1', course_id: 'C1' });

  // lean() + virtual populate
  const s = await Student.findOne({ id: 'S1' }).populate('course').lean();
  console.log('Student:', s);
  
  await mongoose.connection.close();
}
run();
