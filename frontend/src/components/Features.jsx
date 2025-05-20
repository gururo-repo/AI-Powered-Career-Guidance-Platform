import React from 'react';
import { Card, CardContent } from './ui/card';
import { BriefcaseIcon, BookOpen, LineChart, FileText, Award, Trophy } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <BriefcaseIcon className="h-10 w-10 text-cyan-400" />,
      title: "AI Job Matching",
      description: "Get personalized job recommendations based on your skills and preferences."
    },
    {
      icon: <BookOpen className="h-10 w-10 text-cyan-400" />,
      title: "Skill Gap Analysis",
      description: "Identify missing skills and get course recommendations to improve your profile."
    },
    {
      icon: <LineChart className="h-10 w-10 text-cyan-400" />,
      title: "Industry Insights",
      description: "Access real-time data on industry trends, salary ranges, and in-demand skills."
    },
    {
      icon: <FileText className="h-10 w-10 text-cyan-400" />,
      title: "Resume Builder",
      description: "Create an ATS-optimized resume with AI assistance and get feedback."
    },
    {
      icon: <Award className="h-10 w-10 text-cyan-400" />,
      title: "Competency Testing",
      description: "Take assessments to showcase your skills and stand out to employers."
    },
    {
      icon: <Trophy className="h-10 w-10 text-cyan-400" />,
    title:"Get Your Personalized Career Roadmap",
    description:"Let AI guide your journey — assess your skills, fix your gaps, build your resume, all in one smart plan."
    },
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-cyan-100">Features That Set Us Apart</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-cyan-50">
            Our AI-powered platform helps you navigate your career journey with confidence.
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border transform  duration-500 shadow-lg rounded-2xl hover:bg-transparent
    hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400 hover:border-cyan-400 hover:border-2 h-60 w-auto"
          >
            <CardContent className="pt-6 text-center flex flex-row items-center">
              <div className="flex flex-col items-center justify-center color-cyan-50">
                {feature.icon}
                <h3 className="text-xl font-bold mb-2 text-cyan-100 pt-2">{feature.title}</h3>
                <p className="text-muted-foreground text-cyan-50 pt-2">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
  )
}

export default Features