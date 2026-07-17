// 📄 File: src/types/student.ts

export interface StudentProfileResponse {
  studentId: string;
  studentCode: string;
  fullName: string;
  cccd: string;
  email: string;
  phone: string;
  faculty: string;
  academicYear: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  emergencyContact: string;
  permanentAddress: string;
  avatarUrl: string;
  status: string;

  dob: string;
  gender: string;
  issueDate: string;
  issuePlace: string;
  pob: string;
  ethnic: string;
  religion: string;
  cohort: string;
  contactAddress: string;
  fatherYob: number;
  fatherJob: string;
  motherYob: number;
  motherJob: string;
  familyContact: string;
}
