'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shadcn/ui/table";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Plus, BookOpen, Trash2, CheckCircle, ArrowLeft, Save, Edit3, X, Check } from "lucide-react";
import { useState, useContext, useRef } from "react";
import { AddSubjectsContext } from "@/context/AddSubjectsContext";
import { toast } from "sonner";

function AddSubjects({ setCurrentStep, goToPreviousStep }) {

    const { subjects, setSubjects, totalSubjects, addTotalSubjects, selectedSubjects, setSelectedSubjects } = useContext(AddSubjectsContext);

    // Errors state - to track validation errors
    const [errors, setErrors] = useState({});

    // New subject state - to track the new subject being added
    const [newSubject, setNewSubject] = useState({ name: "" });
    // to track the assessment being edited
    const [editingAssessment, setEditingAssessment] = useState(null);
    // the checked subjects
    const [selectedQuickSubjects, setSelectedQuickSubjects] = useState([]);
    // the assessment templates
    const [assessmentTemplate, setAssessmentTemplate] = useState([]);
    // to show the template options
    const [showTemplateOptions, setShowTemplateOptions] = useState(false);
    // the assessment structures
    const [assessmentStructures, setAssessmentStructures] = useState([]);
    // to track the last added count
    const lastAddedCountRef = useRef(0);

    // Handle add subject - custom subject (update addTotalSubjects and setSelectedQuickSubjects states)
    const addCustomSubject = () => {
        // first ensure that the subject name is not empty
        if (newSubject.name.trim()) {
            const subjectName = newSubject.name.trim();
            // Check if subject already exists in subjects array
            const existingSubjectNames = subjects.map(s => s.name.toLowerCase());
            if (existingSubjectNames.includes(subjectName.toLowerCase())) {
                toast.error(`Subject "${subjectName}" already exists!`);
                setNewSubject({ name: "" });
                return;
            }
            // Check if subject is already selected
            if (selectedQuickSubjects.includes(subjectName)) {
                toast.error(`Subject "${subjectName}" is already selected!`);
                setNewSubject({ name: "" });
                return;
            }
            // add to the total subjects array (for future quick selection)
            addTotalSubjects(subjectName);
            // add to selectedQuickSubjects (will be added to subjects when user clicks "Add X Selected Subject(s)")
            setSelectedQuickSubjects(prev => [...prev, subjectName]);
            // clear the new subject state
            setNewSubject({ name: "" });
            toast.success(`Subject "${subjectName}" selected! Click "Add Selected Subject(s)" to add it.`);
        }
    };

    // Handle subject toggle - remove/add to selectedQuickSubjects subjects array state
    const toggleQuickSubject = (subjectName) => {
        // Check if subject already exists in subjects array (to prevent adding the same subject twice)
        const existingSubjectNames = subjects.map(s => s.name.toLowerCase());
        if (existingSubjectNames.includes(subjectName.toLowerCase())) {
            toast.error(`Subject "${subjectName}" is already added!`);
            return;
        }

        // if the subject is already selected, remove it from the selected subjects array state.
        setSelectedQuickSubjects(prev => {
            if (prev.includes(subjectName)) {
                return prev.filter(name => name !== subjectName);
            } else {
                return [...prev, subjectName];
            }
        });
    };

    // Handle add selected quick subjects - keyword: actually add quickly selected subjects to the form data - subjects array
    const addSelectedQuickSubjects = () => {
        // Filter out subjects that already exist - by name
        const existingSubjectNames = subjects.map(subject => subject.name.toLowerCase());
        const subjectsToAdd = selectedQuickSubjects.filter(subjectName =>
            !existingSubjectNames.includes(subjectName.toLowerCase())
        );

        // If no new subjects to add, show message and return
        if (subjectsToAdd.length === 0) {
            toast.info("All selected subjects already exist!");
            setShowTemplateOptions(false);
            return;
        }

        // Take all the subjects selected via the checkmark and for each subject, create a new subject object with id, name, and assessments
        const newSubjects = subjectsToAdd.map(subjectName => ({
            id: Date.now() + Math.random(),
            name: subjectName,
            // if there is an assessment template, use it, otherwise, use an empty array
            assessments: assessmentTemplate.length > 0 ? [...assessmentTemplate] : []
        }));

        // Updates the form data by adding all new subjects to the existing subjects array
        setSubjects(prev => [...prev, ...newSubjects]);
        // Update last added count
        lastAddedCountRef.current = newSubjects.length;
        // Cleans up the selection state:
        setSelectedQuickSubjects([]);
        setShowTemplateOptions(false);
        toast.success(`${newSubjects.length} subject${newSubjects.length > 1 ? 's' : ''} added successfully!`);
    };

    // Check if assessment structure is saved and matches current assessments
    const isStructureSavedAndMatches = (subject) => {
        if (!subject || subject.assessments.length === 0) return false;

        const structureName = `${subject.name} Structure`;
        const savedStructure = assessmentStructures.find(structure => structure.name === structureName);

        if (!savedStructure) return false;

        // Check if the total is 100%
        const total = subject.assessments.reduce((sum, assessment) =>
            sum + (parseFloat(assessment.percentage) || 0), 0
        );
        if (total !== 100) return false;

        // Check if the assessments match (same count and same names/percentages)
        if (savedStructure.assessments.length !== subject.assessments.length) return false;

        // Create normalized arrays for comparison
        const savedAssessments = savedStructure.assessments
            .map(a => ({ name: a.name.trim().toLowerCase(), percentage: parseFloat(a.percentage) || 0 }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const currentAssessments = subject.assessments
            .map(a => ({ name: a.name.trim().toLowerCase(), percentage: parseFloat(a.percentage) || 0 }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Compare each assessment
        for (let i = 0; i < savedAssessments.length; i++) {
            if (savedAssessments[i].name !== currentAssessments[i].name ||
                savedAssessments[i].percentage !== currentAssessments[i].percentage) {
                return false;
            }
        }

        return true;
    };

    // Handle save assessment structure
    const saveAssessmentStructure = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (subject && subject.assessments.length > 0) {
            const total = subject.assessments.reduce((sum, assessment) =>
                sum + (parseFloat(assessment.percentage) || 0), 0
            );

            // Only save if total equals 100%
            if (total === 100) {
                const structureName = `${subject.name} Structure`;

                // Check if structure already exists and update it
                const existingStructure = assessmentStructures.find(structure =>
                    structure.name === structureName
                );

                if (existingStructure) {
                    // Update existing structure
                    setAssessmentStructures(prev => prev.map(structure =>
                        structure.id === existingStructure.id
                            ? {
                                ...structure,
                                assessments: subject.assessments.map(assessment => ({
                                    name: assessment.name,
                                    percentage: assessment.percentage
                                }))
                            }
                            : structure
                    ));
                    toast.success("Assessment structure updated successfully!");
                } else {
                    // Create new structure
                    const newStructure = {
                        id: Date.now(),
                        name: structureName,
                        assessments: subject.assessments.map(assessment => ({
                            name: assessment.name,
                            percentage: assessment.percentage
                        }))
                    };
                    setAssessmentStructures(prev => [...prev, newStructure]);
                    toast.success("Assessment structure saved successfully!");
                }
            } else {
                toast.error("Assessment structure must total exactly 100% to save");
            }
        }
    };

    // Handle create assessment template from existing subject
    const createTemplateFromSubject = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        // if the subject exists and has assessments, create a new assessment template with the assessments 
        if (subject && subject.assessments.length > 0) {
            setAssessmentTemplate(subject.assessments.map(assessment => ({
                ...assessment,
                id: Date.now() + Math.random() // Generate new IDs
            })));
            // then, set the show template options to true
            setShowTemplateOptions(true);
        }
    };

    // Handle apply assessment structure from dropdown
    const applyAssessmentStructure = (subjectId, structureId) => {
        const structure = assessmentStructures.find(s => s.id === structureId);
        if (structure) {
            const newAssessments = structure.assessments.map(assessment => ({
                id: Date.now() + Math.random(),
                name: assessment.name,
                percentage: assessment.percentage
            }));

            setSubjects(prev => prev.map(subject =>
                subject.id === subjectId
                    ? { ...subject, assessments: newAssessments }
                    : subject
            ));
            toast.success(`Assessment structure applied successfully!`);
        }
    };

    // Handle apply template to all subjects
    const applyTemplateToAllSubjects = () => {
        if (assessmentTemplate.length > 0) {
            setSubjects(prev => prev.map(subject => ({
                ...subject,
                assessments: assessmentTemplate.map(assessment => ({
                    ...assessment,
                    id: Date.now() + Math.random() // Generate new IDs for each subject
                }))
            })));
            toast.success("Template applied to all subjects!");
        }
    };

    // Handle clear template
    const clearTemplate = () => {
        setAssessmentTemplate([]);
        toast.info("Template cleared");
    };

    // Handle remove subject - onclick of the trash icon
    const removeSubject = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
            // Remove the subject
            setSubjects(prev => prev.filter(s => s.id !== subjectId));

            // Remove the associated assessment structure
            const structureName = `${subject.name} Structure`;
            setAssessmentStructures(prev => prev.filter(structure => structure.name !== structureName));
        }
    };

    // Handle add assessment - onclick of the plus icon
    const addAssessment = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const currentTotal = subject.assessments.reduce((sum, assessment) =>
            sum + (parseFloat(assessment.percentage) || 0), 0
        );

        // Only allow adding if current total is less than 100%
        if (currentTotal < 100) {
            const newAssessment = { id: Date.now(), name: "", percentage: "" };
            setSubjects(prev => prev.map(subject =>
                subject.id === subjectId
                    ? { ...subject, assessments: [...subject.assessments, newAssessment] }
                    : subject
            ));
            setEditingAssessment(newAssessment.id);

            // Clear the "at least one assessment is required" error for this subject
            const subjectIndex = subjects.findIndex(s => s.id === subjectId);
            if (subjectIndex !== -1) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`subject_${subjectIndex}_assessments`];
                    return newErrors;
                });
            }
        }
    };

    // Handle update assessment
    const updateAssessment = (subjectId, assessmentId, field, value) => {
        // If updating percentage, validate it doesn't exceed 100
        if (field === 'percentage') {
            const numValue = parseFloat(value);
            // Allow empty string for clearing the field
            if (value === '' || value === '0') {
                // Allow empty or zero values
            } else if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                return; // Don't update if value is invalid or exceeds 100
            }
        }
        setSubjects(prev => prev.map(subject =>
            subject.id === subjectId
                ? {
                    ...subject,
                    assessments: subject.assessments.map(assessment =>
                        assessment.id === assessmentId
                            ? { ...assessment, [field]: value }
                            : assessment
                    )
                }
                : subject
        ));
    };

    // Handle remove assessment
    const removeAssessment = (subjectId, assessmentId) => {
        setSubjects(prev => prev.map(subject =>
            subject.id === subjectId
                ? {
                    ...subject,
                    assessments: subject.assessments.filter(assessment => assessment.id !== assessmentId)
                }
                : subject
        ));
    };

    // Handle validate assessment percentages
    const validateAssessmentPercentages = (assessments) => {
        if (assessments.length === 0) return false;
        const total = assessments.reduce((sum, assessment) => sum + (parseFloat(assessment.percentage) || 0), 0);
        return total === 100;
    };

    // Handle form validation
    const validateForm = () => {
        const newErrors = {};

        // Subjects validation
        if (subjects.length === 0) {
            newErrors.subjects = "At least one subject is required";
        }

        // Validate each subject
        subjects.forEach((subject, subjectIndex) => {
            if (!subject.name.trim()) {
                newErrors[`subject_${subjectIndex}_name`] = "Subject name is required";
            }

            // Assessments validation
            if (subject.assessments.length === 0) {
                newErrors[`subject_${subjectIndex}_assessments`] = "At least one assessment is required";
            } else {
                // Validate assessment percentages - must equal exactly 100%
                const total = subject.assessments.reduce((sum, assessment) =>
                    sum + (parseFloat(assessment.percentage) || 0), 0
                );
                if (total !== 100) {
                    if (total > 100) {
                        newErrors[`subject_${subjectIndex}_percentages`] = "Assessment percentages must equal exactly 100% (currently " + total + "%)";
                    } else {
                        newErrors[`subject_${subjectIndex}_percentages`] = "Assessment percentages must equal exactly 100% (currently " + total + "%)";
                    }
                }

                // Validate individual assessments
                subject.assessments.forEach((assessment, assessmentIndex) => {
                    if (!assessment.name.trim()) {
                        newErrors[`subject_${subjectIndex}_assessment_${assessmentIndex}_name`] = "Assessment name is required";
                    }
                    if (!assessment.percentage || assessment.percentage <= 0) {
                        newErrors[`subject_${subjectIndex}_assessment_${assessmentIndex}_percentage`] = "Assessment percentage must be greater than 0";
                    }
                    if (assessment.percentage > 100) {
                        newErrors[`subject_${subjectIndex}_assessment_${assessmentIndex}_percentage`] = "Assessment percentage must not exceed 100%";
                    }
                });
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submission of form data
    const handleAddSubjectsSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            setSelectedSubjects(subjects);
            setCurrentStep(prev => prev + 1);
        }
    };

    // Add the subjects you teach with their assessment structures
    return (
        <form onSubmit={handleAddSubjectsSubmit} className="space-y-6">

            {/* Add Subject Section */}
            <div className="space-y-4">

                {/* Quick Subject Selection */}
                <div className="space-y-4">

                    {/* Render the predefined subjects with checkboxes and labels == subject names */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Render the predefined subjects */}
                        {totalSubjects.map((subject) => {
                            // Logic to render the subject as checked (strikethrough) when added to the subjects array
                            const existingSubjectNames = subjects.map(s => s.name.toLowerCase());
                            const isAlreadyAdded = existingSubjectNames.includes(subject.toLowerCase()); // strikethrough the label when the subject is already added to the subjects array
                            const isSelected = selectedQuickSubjects.includes(subject); // to disable the checkbox when the subject is already added to the subjects array

                            return (
                                <div key={subject} className="flex items-center space-x-2">
                                    <Input
                                        type="checkbox"
                                        id={`subject-${subject}`}
                                        checked={isSelected}
                                        // to toggle the selectedQuickSubjects array state
                                        onChange={() => toggleQuickSubject(subject)}
                                        disabled={isAlreadyAdded}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <Label
                                        htmlFor={`subject-${subject}`}
                                        className={`text-sm cursor-pointer ${isAlreadyAdded ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                                    >
                                        {subject}
                                    </Label>
                                </div>
                            );
                        })}
                    </div>


                    {selectedQuickSubjects.length > 0 && (
                        <div className="space-y-3">
                            {/* If there are selected subjects, show the "Add Selected Subject(s)" button (Selection stage) */}
                            <div className="flex items-center gap-2">
                                <Button type="button" onClick={addSelectedQuickSubjects} className="bg-green-600 hover:bg-green-700">
                                    <Check className="w-4 h-4 mr-2" />
                                    {(() => {
                                        const currentCount = selectedQuickSubjects.length;
                                        const lastAdded = lastAddedCountRef.current;

                                        if (lastAdded === 0) {
                                            // First time - no subjects added yet, show "Added X subjects" (they're selected)
                                            return `Add ${currentCount} Subject${currentCount > 1 ? 's' : ''}`;
                                        } else {
                                            // Subjects were already added to form, show "Add Extra X subject(s)"
                                            return `Add Extra ${currentCount} Subject${currentCount > 1 ? 's' : ''}`;
                                        }
                                    })()}
                                </Button>
                                {/* <Button type="button" variant="outline" onClick={() => setSelectedQuickSubjects([])}>
                                    Clear Selection
                                </Button> */}
                            </div>

                            {/* Assessment Template Options */}
                            {/* If there is something in the selection stage */}
                            {selectedQuickSubjects.length > 1 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            <Label className="text-sm font-medium text-blue-800">
                                                Assessment Structure Template
                                            </Label>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            Since you're adding multiple subjects, you can copy an assessment structure from an existing subject or create a new one.
                                        </p>

                                        {/* List of existing Subjects in the selection stage - for fast copy of assessment structure by creating an assessment template from an existing subject */}
                                        {subjects.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-blue-800">
                                                    Copy from existing subject:
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {subjects.map(subject => (
                                                        <Button
                                                            key={subject.id}
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => createTemplateFromSubject(subject.id)}
                                                            disabled={subject.assessments.length === 0}
                                                            className="text-xs"
                                                        >
                                                            {subject.name} ({subject.assessments.length} assessments)
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Apply to all existing subjects and Clear Template Buttons */}
                                        {assessmentTemplate.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">
                                                        Template created with {assessmentTemplate.length} assessment{assessmentTemplate.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={applyTemplateToAllSubjects}
                                                        className="text-xs"
                                                    >
                                                        Apply to All Existing Subjects
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={clearTemplate}
                                                        className="text-xs text-red-600 hover:text-red-700"
                                                    >
                                                        Clear Template
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ------------------------------------------------------------------------------------------------------------------- */}


                {/* Add Custom Subject - update newSubject state, then on click, call addCustomSubject function */}
                <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                        <Label className="text-sm font-medium text-gray-700">
                            Or Add Custom Subject
                        </Label>
                        <p className="text-sm text-gray-500">Add a subject not in the list above</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="subjectName" className="text-sm font-medium text-gray-700">
                                Subject Name
                            </Label>
                            <Input
                                id="subjectName"
                                placeholder="e.g., Advanced Mathematics, Creative Writing"
                                value={newSubject.name}
                                onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                                className="transition-all duration-200 focus-visible:ring-blue-500"
                            />
                        </div>
                        <div>
                            <Button type="button" onClick={addCustomSubject} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Custom Subject
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Show validation errors */}
                {errors.subjects && (
                    <p className="text-sm text-red-500">{errors.subjects}</p>
                )}

                {/* ------------------------------------------------------------------------------------------------------------------- */}

            </div>

            {/* Subjects List - with assessment structure and actions*/}
            {subjects.length > 0 && (
                <div className="space-y-6">
                    {subjects.map((subject, subjectIndex) => (
                        <Card key={subject.id} className="border border-gray-200">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">
                                            {subject.name}
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Assessment Structure
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSubject(subject.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Assessment Table */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Assessment Components
                                        </Label>
                                        <div className="flex gap-2">
                                            {/* Save Structure Button - only show if structure is not saved or doesn't match */}
                                            {subject.assessments.length > 0 && !isStructureSavedAndMatches(subject) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => saveAssessmentStructure(subject.id)}
                                                    disabled={subject.assessments.length === 0 || subject.assessments.reduce((sum, assessment) => sum + (parseFloat(assessment.percentage) || 0), 0) !== 100}
                                                    className="text-xs"
                                                >
                                                    Save Structure
                                                </Button>
                                            )}

                                            {/* Apply Structure Dropdown */}
                                            {assessmentStructures.length > 0 && (
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            applyAssessmentStructure(subject.id, parseInt(e.target.value));
                                                            e.target.value = ""; // Reset selection
                                                        }
                                                    }}
                                                    className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white"
                                                    defaultValue=""
                                                >
                                                    <option value="">Apply Structure</option>
                                                    {assessmentStructures.map(structure => (
                                                        <option key={structure.id} value={structure.id}>
                                                            {structure.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addAssessment(subject.id)}
                                                disabled={subject.assessments.reduce((sum, assessment) => sum + (parseFloat(assessment.percentage) || 0), 0) >= 100}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Assessment
                                            </Button>
                                        </div>
                                    </div>

                                    {subject.assessments.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Assessment Type</TableHead>
                                                    <TableHead>Percentage</TableHead>
                                                    <TableHead className="w-[100px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {subject.assessments.map((assessment) => (
                                                    <TableRow key={assessment.id}>
                                                        <TableCell>
                                                            {editingAssessment === assessment.id ? (
                                                                <Input
                                                                    value={assessment.name}
                                                                    onChange={(e) => updateAssessment(subject.id, assessment.id, 'name', e.target.value)}
                                                                    placeholder="e.g., CA, Exam, Project"
                                                                    className="w-full"
                                                                />
                                                            ) : (
                                                                <span className={assessment.name ? "" : "text-gray-400"}>
                                                                    {assessment.name || "Click to edit"}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {editingAssessment === assessment.id ? (
                                                                <div className="space-y-1">
                                                                    <Input
                                                                        type="number"
                                                                        value={assessment.percentage}
                                                                        onChange={(e) => updateAssessment(subject.id, assessment.id, 'percentage', e.target.value)}
                                                                        placeholder="0"
                                                                        className={`w-full ${parseFloat(assessment.percentage) > 100 ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                                        min="0"
                                                                        max="100"
                                                                    />
                                                                    {parseFloat(assessment.percentage) > 100 && (
                                                                        <p className="text-xs text-red-500">Percentage cannot exceed 100%</p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className={`${assessment.percentage ? "" : "text-gray-400"} ${parseFloat(assessment.percentage) > 100 ? "text-red-500 font-semibold" : ""}`}>
                                                                    {assessment.percentage ? `${assessment.percentage}%` : "Click to edit"}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {editingAssessment === assessment.id ? (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setEditingAssessment(null)}
                                                                        className="text-green-600 hover:text-green-700"
                                                                    >
                                                                        <Save className="w-4 h-4" />
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setEditingAssessment(assessment.id)}
                                                                        className="text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeAssessment(subject.id, assessment.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No assessments added yet. Click "Add Assessment" to get started.</p>
                                        </div>
                                    )}

                                    {/* Validation Messages */}
                                    {errors[`subject_${subjectIndex}_assessments`] && (
                                        <p className="text-sm text-red-500">{errors[`subject_${subjectIndex}_assessments`]}</p>
                                    )}
                                    {errors[`subject_${subjectIndex}_percentages`] && (
                                        <p className="text-sm text-red-500">{errors[`subject_${subjectIndex}_percentages`]}</p>
                                    )}

                                    {/* Total Percentage Display */}
                                    {subject.assessments.length > 0 && (
                                        <div className="text-right">
                                            {(() => {
                                                const total = subject.assessments.reduce((sum, assessment) =>
                                                    sum + (parseFloat(assessment.percentage) || 0), 0
                                                );
                                                const isValid = total === 100;
                                                const isOverLimit = total > 100;
                                                const isUnderLimit = total < 100;

                                                return (
                                                    <div className="space-y-1">
                                                        <span className={`text-sm font-medium ${isValid ? 'text-green-600' : isOverLimit ? 'text-red-500' : 'text-orange-500'}`}>
                                                            Total: {total}%
                                                        </span>
                                                        {!isValid && (
                                                            <p className="text-xs text-red-500">{isUnderLimit ? "Total should be 100%. Please add more assessments to make it 100%." : "Total should be 100%. Please adjust the percentages or remove assessments to make it 100%."}</p>
                                                        )}
                                                        {isValid && (
                                                            <p className="text-xs text-green-500">Total is 100%.You can save this assessment structure now.</p>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Navigation Buttons - Back and Proceed to Add Students */}
            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex-1"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                    Proceed to Add Students
                    <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
            </div>

        </form>
    );
}

export default AddSubjects;