import React from 'react';

const RecommendedCoursesTable = ({ courses = [] }) => {
  // Generate fallback courses if none provided
  const displayCourses = courses.length > 0 ? courses : [
    { 
      name: "Modern JavaScript", 
      platform: "Udemy", 
      skillsCovered: ["JavaScript", "ES6", "Async/Await"],
      url: "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/"
    },
    { 
      name: "React - The Complete Guide", 
      platform: "Udemy", 
      skillsCovered: ["React", "Redux", "React Hooks"],
      url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"
    },
    { 
      name: "AWS Certified Developer", 
      platform: "A Cloud Guru", 
      skillsCovered: ["AWS", "Cloud", "Serverless"],
      url: "https://acloudguru.com/course/aws-certified-developer-associate"
    }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-cyan-50">
        <thead className="text-xs uppercase text-cyan-100/70 border-b border-zinc-700">
          <tr>
            <th scope="col" className="px-4 py-3">Course</th>
            <th scope="col" className="px-4 py-3">Platform</th>
            <th scope="col" className="px-4 py-3">Skills Covered</th>
          </tr>
        </thead>
        <tbody>
          {displayCourses.map((course, index) => (
            <tr key={index} className="border-b border-zinc-800">
              <td className="px-4 py-3 font-medium">
                {course.url ? (
                  <a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:underline"
                  >
                    {course.name}
                  </a>
                ) : (
                  course.name
                )}
              </td>
              <td className="px-4 py-3">{course.platform}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {course.skillsCovered?.slice(0, 2).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-100/10 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {course.skillsCovered?.length > 2 && (
                    <span className="px-2 py-1 bg-cyan-100/5 rounded-full text-xs">
                      +{course.skillsCovered.length - 2} more
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecommendedCoursesTable; 