// 📄 File: src/types/student.ts

export interface Student {
  id: string;
  fullName: string;
  cccd: string;
  studentId: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  placeOfBirth: string;
  permanentAddress: string;
  major: string;
  faculty: string;
  university: string;
  class: string;
  intake: number;
  graduated: boolean;
  phoneNumber: string;
  email: string;
  parentName: string;
  parentPhoneNumber: string;
  profilePicture: string;
  assignment: {
    id: string;
    room: {
      id: string;
      name: string;
      building: {
        id: string;
        name: string;
      };
    };
  } | null;
}
