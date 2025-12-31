"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function ViewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Setup Complete!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your teacher account and class have been successfully configured.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-gray-700">
              Welcome to your new classroom management system! You can now:
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
              <li>• View and manage your students</li>
              <li>• Track attendance and grades</li>
              <li>• Generate reports and analytics</li>
              <li>• Manage your subjects and assessments</li>
            </ul>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                The spreadsheet view will be available here soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
