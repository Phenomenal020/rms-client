"use client";

import { createContext, useState } from "react";

export const AddSubjectsContext = createContext();

export const AddSubjectsProvider = ({ children }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const updateSelectedSubjects = (subjects) => {
    setSelectedSubjects(subjects);
  };

  return (
    <AddSubjectsContext.Provider
      value={{ selectedSubjects, updateSelectedSubjects }}
    >
      {children}
    </AddSubjectsContext.Provider>
  );
};
