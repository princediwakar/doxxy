import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Baby, Shield, Bone, Stethoscope, Eye, Activity } from 'lucide-react';

const ColorThemeDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Doxxy Healthcare Theme</h1>
        <p className="text-muted-foreground text-lg">
          Professional, accessible, and doctor-friendly color palette
        </p>
      </div>

      {/* Primary Actions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-primary">Primary Actions & Navigation</CardTitle>
          <CardDescription>Key interactive elements using medical blue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Schedule Appointment
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              View Patient Records
            </Button>
            <Button variant="secondary">Secondary Action</Button>
          </div>
        </CardContent>
      </Card>

      {/* Status System */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-accent">Healthcare Status System</CardTitle>
          <CardDescription>Clear status indicators for medical workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <span className="status-badge status-active">
              Active Patient
            </span>
            <span className="status-badge status-pending">
              Pending Review
            </span>
            <span className="status-badge status-inactive">
              Discharged
            </span>
            <span className="status-badge status-urgent">
              Critical Alert
            </span>
          </div>
          
          {/* Alert Examples */}
          <div className="space-y-3 mt-6">
            <div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg">
              ✓ Patient vitals updated successfully
            </div>
            <div className="bg-warning/10 border border-warning/20 text-warning p-4 rounded-lg">
              ⚠ Lab results pending review
            </div>
            <div className="bg-info/10 border border-info/20 text-info p-4 rounded-lg">
              ℹ Next appointment scheduled for tomorrow
            </div>
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
              ⚡ Critical: Blood pressure elevated
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Colors */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Medical Specialties</CardTitle>
          <CardDescription>Color-coded department identification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Heart className="w-6 h-6 text-medical-red" />
              <div>
                <p className="font-medium text-medical-red">Cardiology</p>
                <p className="text-sm text-muted-foreground">Heart & Circulation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <Brain className="w-6 h-6 text-medical-purple" />
              <div>
                <p className="font-medium text-medical-purple">Neurology</p>
                <p className="text-sm text-muted-foreground">Brain & Nervous System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
              <Baby className="w-6 h-6 text-medical-pink" />
              <div>
                <p className="font-medium text-medical-pink">Pediatrics</p>
                <p className="text-sm text-muted-foreground">Child Healthcare</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <Bone className="w-6 h-6 text-medical-amber" />
              <div>
                <p className="font-medium text-medical-amber">Orthopedics</p>
                <p className="text-sm text-muted-foreground">Bones & Joints</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20">
              <Eye className="w-6 h-6 text-medical-teal" />
              <div>
                <p className="font-medium text-medical-teal">Dermatology</p>
                <p className="text-sm text-muted-foreground">Skin & Hair</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <Stethoscope className="w-6 h-6 text-medical-green" />
              <div>
                <p className="font-medium text-medical-green">Internal Medicine</p>
                <p className="text-sm text-muted-foreground">General Health</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
              <Shield className="w-6 h-6 text-medical-indigo" />
              <div>
                <p className="font-medium text-medical-indigo">Oncology</p>
                <p className="text-sm text-muted-foreground">Cancer Treatment</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Activity className="w-6 h-6 text-medical-red" />
              <div>
                <p className="font-medium text-medical-red">Emergency</p>
                <p className="text-sm text-muted-foreground">Urgent Care</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Showcase */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="medical-card shadow-medical">
          <CardHeader>
            <CardTitle className="text-foreground">Patient Dashboard</CardTitle>
            <CardDescription>Example patient information card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Blood Pressure</span>
              <Badge className="bg-success/10 text-success border-success/20">Normal</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Heart Rate</span>
              <Badge className="bg-warning/10 text-warning border-warning/20">Elevated</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Temperature</span>
              <Badge className="bg-success/10 text-success border-success/20">Normal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card shadow-medical-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Color Accessibility</CardTitle>
            <CardDescription>High contrast, WCAG compliant design</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p className="text-foreground">Primary text: High contrast</p>
              <p className="text-muted-foreground">Secondary text: Readable</p>
              <p className="text-primary">Interactive elements: Clear focus</p>
              <p className="text-success">Success states: Positive feedback</p>
              <p className="text-warning">Warning states: Clear attention</p>
              <p className="text-destructive">Error states: Immediate recognition</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12 p-6 bg-muted/30 rounded-xl">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Professional Healthcare Design
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This color palette is carefully crafted for healthcare professionals, 
          ensuring trust, accessibility, and clarity across all medical specialties. 
          The design works seamlessly in both light and dark modes for comfortable 
          use during day and night shifts.
        </p>
      </div>
    </div>
  );
};

export default ColorThemeDemo; 