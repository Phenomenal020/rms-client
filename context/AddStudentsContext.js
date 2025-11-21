'use client';

import { createContext, useContext, useState } from 'react';

export const AddStudentsContext = createContext();

export const AddStudentsProvider = ({ children }) => {
    const [students, setStudents] = useState([]);

    const [newStudent, setNewStudent] = useState({
        name: "",
        dateOfBirth: "",
        gender: "",
        className: "",
        id: "",
        department: "",
        daysPresent: "",
        daysAbsent: "",
        subjects: []
    });

    return (
        <AddStudentsContext.Provider value={{ students, setStudents, newStudent, setNewStudent }}>
            {children}
        </AddStudentsContext.Provider>
    );
};