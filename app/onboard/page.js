"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CheckCircle } from "lucide-react";

import TeacherProfile from '@/app/onboard/(components)/TeacherProfile';
import SchoolSetup from '@/app/onboard/(components)/SchoolSetup';
import AddSubjects from '@/app/onboard/(components)/AddSubjects';
import AddStudents from '@/app/onboard/(components)/AddStudents';

export default function TeacherOnboarding() {
  const router = useRouter();

  // multistep form and submit states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // go to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // When the form is submitted
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
              <p className="text-gray-600">
                Your teacher account has been created successfully. You can now start managing your classroom.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  school: "",
                  class: "",
                  schoolLocation: "",
                  schoolMotto: "",
                  termStart: "",
                  termEnd: "",
                  gradingSystem: [],
                  resultTemplate: null,
                  subjects: [],
                  students: []
                });
                setErrors({});
              }}
              className="w-full"
            >
              Create Another Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Return the general layout of the page with slots for the form steps components.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">

      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        {/* Main Header - before the form, just above the progress indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Onboarding</h1>
          <p className="text-gray-700 max-w-md mx-auto">
            {currentStep === 1
              ? "Welcome! Let's get you set up with your teacher account. This will only take a few minutes."
              : currentStep === 2
                ? "Now let's set up your school information and grading system."
                : currentStep === 3
                  ? "Next, let's add your subjects and their assessment structures."
                  : "Finally, let's add your students to complete the setup."
            }
          </p>
        </div>

        {/* Progress Indicator - 1 -> 2 -> 3 -> 4 */}
        {/* Simply dhange the background colour of the div based on the current step */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
            <div className={`w-16 h-1 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              4
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Headers of each form step  - ie, in the card form*/}
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {currentStep === 1
                ? 'Create Your Teacher Profile'
                : currentStep === 2
                  ? 'Set Up Your School Information'
                  : currentStep === 3
                    ? 'Add Subjects & Assessments'
                    : 'Add Students'
              }
            </CardTitle>
            <CardDescription className="text-gray-600">
              {currentStep === 1
                ? 'Please fill in your personal details to get started'
                : currentStep === 2
                  ? 'Configure your school information and grading system (for populating the result sheet)'
                  : currentStep === 3
                    ? 'Define your subjects and their assessment structures'
                    : 'Add students to your class with their details and subject selections'
              }
            </CardDescription>
          </CardHeader>

          {/* Components of each form step as card content */}
          <CardContent>
            {currentStep === 1 ?
              <TeacherProfile setCurrentStep={setCurrentStep} />
              : currentStep === 2 ? <SchoolSetup setCurrentStep={setCurrentStep} goToPreviousStep={goToPreviousStep} />
                : currentStep === 3 ? <AddSubjects setCurrentStep={setCurrentStep} goToPreviousStep={goToPreviousStep} />
                  : currentStep === 4 ? <AddStudents setCurrentStep={setCurrentStep} goToPreviousStep={goToPreviousStep} />
                    : <div>Invalid step</div>}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );

}