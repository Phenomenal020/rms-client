'use client'

import { createContext, useState } from 'react'

export const AddSubjectsContext = createContext();

export const AddSubjectsProvider = ({ children }) => {

    const [totalSubjects, setTotalSubjects] = useState([
        "English Language",
        "General Mathematics",
        "Citizenship Studies",
        "Heritage Studies",
        "Digital Technologies",
        "Biology",
        "Chemistry",
        "Physics",
        "Agriculture",
        "Further Mathematics",
        "Physical Education",
        "Health Education",
        "Foods & Nutrition",
        "Geography",
        "Technical Drawing",
        "Nigerian History",
        "Government",
        // "Christian Religion Studies",
        "Islamic Studies",
        "Nigerian Languages",
        "French Language",
        "Arabic Language",
        "Visual Arts",
        "Music",
        "Literature in English",
        "Home Management",
        "Catering Craft",
        "Accounting",
        "Commerce",
        "Marketing",
        "Economics",
        // "Solar Photovoltaic Installation and Maintenance",
        // "Fashion Design and Garment Making",
        "Livestock Farming",
        // "Beauty and Cosmetology",
        // "Computer Hardware and GSM Repairs",
        // "Horticulture and Crop Production",
    ]);

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const addTotalSubjects = (subject) => {
        setTotalSubjects(prev => [...prev, subject]);
    }

    const [subjects, setSubjects] = useState([]);

    return (
        <AddSubjectsContext.Provider value={{ subjects, setSubjects, totalSubjects, addTotalSubjects, selectedSubjects, setSelectedSubjects }}>
            {children}
        </AddSubjectsContext.Provider>
    )
}