import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Professional Resume Template Component
 * A clean, ATS-friendly resume template with professional design elements
 * Designed to match the layout in the provided image
 */

// Bullet point item component
const BulletItem = ({ text }) => (
  <div className="flex items-start mb-1.5">
    <div className="text-gray-500 mr-2 mt-1">•</div>
    <p className="text-sm text-gray-700">{text}</p>
  </div>
);

// Skill category component
const SkillCategory = ({ title, skills }) => (
  <div className="mb-2">
    <div className="text-sm font-semibold mb-1">{title}:</div>
    <div className="text-sm text-gray-700">{skills}</div>
  </div>
);

// Project/Experience item component
const ExperienceItem = ({ item, theme }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 ${theme?.accent || 'text-blue-600'} text-xs`}
            >
              [link]
            </a>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {item.current
            ? `${item.startDate} - Present`
            : `${item.startDate} - ${item.endDate}`}
        </span>
      </div>

      {item.organization && (
        <p className="text-sm text-gray-700 font-medium mb-1">{item.organization}</p>
      )}

      {item.description && typeof item.description === 'string' && (
        <p className="text-sm text-gray-700 mb-2">{item.description}</p>
      )}

      {item.bullets && Array.isArray(item.bullets) && item.bullets.length > 0 && (
        <div className="ml-1">
          {item.bullets.map((bullet, idx) => (
            <BulletItem key={idx} text={bullet} />
          ))}
        </div>
      )}
    </div>
  );
};

// Certificate item component
const CertificateItem = ({ cert, theme }) => (
  <div className="flex justify-between items-center mb-1">
    <div className="flex items-center">
      <CheckCircle2 size={14} className={theme?.accent || 'text-blue-600'} />
      <span className="ml-2 text-sm">{cert.name}</span>
    </div>
    <div className="flex items-center">
      <span className="text-xs text-gray-500 mr-2">{cert.date}</span>
      {cert.link && (
        <a
          href={cert.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${theme?.accent || 'text-blue-600'} text-xs`}
        >
          [link]
        </a>
      )}
    </div>
  </div>
);

const ModernResumeTemplate = ({
  resumeData,
  colorTheme = "blue", // Options: blue, green, purple, orange, red
}) => {
  // Define theme colors based on selection - more professional and subtle colors
  const themeColors = {
    blue: {
      primary: "bg-blue-700",
      secondary: "bg-blue-600",
      accent: "text-blue-600",
      border: "border-blue-600",
      borderLight: "border-blue-200",
      sectionBg: "bg-blue-50",
      sectionTitle: "text-blue-800",
      light: "bg-blue-50"
    },
    green: {
      primary: "bg-emerald-700",
      secondary: "bg-emerald-600",
      accent: "text-emerald-600",
      border: "border-emerald-600",
      borderLight: "border-emerald-200",
      sectionBg: "bg-emerald-50",
      sectionTitle: "text-emerald-800",
      light: "bg-emerald-50"
    },
    purple: {
      primary: "bg-indigo-700",
      secondary: "bg-indigo-600",
      accent: "text-indigo-600",
      border: "border-indigo-600",
      borderLight: "border-indigo-200",
      sectionBg: "bg-indigo-50",
      sectionTitle: "text-indigo-800",
      light: "bg-indigo-50"
    },
    orange: {
      primary: "bg-amber-700",
      secondary: "bg-amber-600",
      accent: "text-amber-600",
      border: "border-amber-600",
      borderLight: "border-amber-200",
      sectionBg: "bg-amber-50",
      sectionTitle: "text-amber-800",
      light: "bg-amber-50"
    },
    red: {
      primary: "bg-rose-700",
      secondary: "bg-rose-600",
      accent: "text-rose-600",
      border: "border-rose-600",
      borderLight: "border-rose-200",
      sectionBg: "bg-rose-50",
      sectionTitle: "text-rose-800",
      light: "bg-rose-50"
    }
  };

  const theme = themeColors[colorTheme] || themeColors.blue;

  // Extract resume data
  const {
    name = "Your Name",
    contactInfo = {},
    skills = {},
    experience = [],
    education = [],
    projects = [],
    certificates = []
  } = resumeData || {};

  // Format skills for display
  const formatSkills = () => {
    if (typeof skills === 'string') {
      return [{ title: 'Skills', skills: skills }];
    }

    if (typeof skills === 'object' && !Array.isArray(skills)) {
      return Object.entries(skills).map(([key, value]) => ({
        title: key,
        skills: Array.isArray(value) ? value.join(', ') : value
      }));
    }

    return [];
  };

  const skillCategories = formatSkills();

  return (
    <div className="bg-white text-gray-800 shadow-lg max-w-4xl mx-auto font-sans border border-gray-200 print:border-0 print:shadow-none">
      {/* Header Section */}
      <header className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 uppercase text-center">{name}</h1>

        {/* Contact Information Row */}
        <div className="flex flex-wrap justify-between text-xs mt-2">
          {contactInfo.email && (
            <a href={`mailto:${contactInfo.email}`} className="text-gray-700 hover:underline">
              Email: {contactInfo.email}
            </a>
          )}
          {contactInfo.mobile && (
            <a href={`tel:${contactInfo.mobile}`} className="text-gray-700 hover:underline">
              Mobile: {contactInfo.mobile}
            </a>
          )}
          {contactInfo.linkedin && (
            <a href={`https://linkedin.com/in/${contactInfo.linkedin}`} className="text-gray-700 hover:underline">
              LinkedIn: {contactInfo.linkedin}
            </a>
          )}
          {contactInfo.website && (
            <a href={contactInfo.website} className="text-gray-700 hover:underline">
              Portfolio: {contactInfo.website}
            </a>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Professional Summary Section */}
        {resumeData.summary && (
          <section className="mb-6">
            <div className={`${theme.sectionBg} py-2 px-4 mb-3`}>
              <h3 className={`${theme.sectionTitle} font-bold text-sm uppercase`}>
                Professional Summary
              </h3>
            </div>
            <div className="px-1">
              <p className="text-sm text-gray-700">{resumeData.summary}</p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Education and Skills */}
          <div className="md:col-span-1">
            {/* Education Section */}
            {education.length > 0 && (
              <section className="mb-6">
                <div className={`${theme.sectionBg} py-2 px-4 mb-3`}>
                  <h3 className={`${theme.sectionTitle} font-bold text-sm uppercase`}>
                    Education
                  </h3>
                </div>
                <div className="px-1">
                  {education.map((edu, index) => (
                    <div key={`edu-${index}`} className="mb-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{edu.title}</h4>
                        <span className="text-xs text-gray-500">
                          {edu.endDate}
                        </span>
                      </div>
                      <p className="text-sm">{edu.organization}</p>
                      {edu.description && (
                        <p className="text-xs text-gray-600 mt-1">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills Section */}
            {skillCategories.length > 0 && (
              <section className="mb-6">
                <div className={`${theme.sectionBg} py-2 px-4 mb-3`}>
                  <h3 className={`${theme.sectionTitle} font-bold text-sm uppercase`}>
                    Skills Summary
                  </h3>
                </div>
                <div className="px-1">
                  {skillCategories.map((category, index) => (
                    <SkillCategory
                      key={`skill-cat-${index}`}
                      title={category.title}
                      skills={category.skills}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Certificates Section */}
            {certificates.length > 0 && (
              <section className="mb-6">
                <div className={`${theme.sectionBg} py-2 px-4 mb-3`}>
                  <h3 className={`${theme.sectionTitle} font-bold text-sm uppercase`}>
                    Certificates
                  </h3>
                </div>
                <div className="px-1">
                  {certificates.map((cert, index) => (
                    <CertificateItem
                      key={`cert-${index}`}
                      cert={cert}
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Work Experience and Projects */}
          <div className="md:col-span-2">
            {/* Work Experience Section */}
            {experience.length > 0 && (
              <section className="mb-6">
                <div className={`${theme.sectionBg} py-2 px-4 mb-3`}>
                  <h3 className={`${theme.sectionTitle} font-bold text-sm uppercase`}>
                    Work Experience
                  </h3>
                </div>
                <div className="px-1">
                  {experience.map((job, index) => (
                    <ExperienceItem
                      key={`exp-${index}`}
                      item={job}
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
              <section className="mb-6">
                <div className={`${theme.sectionBg} py-2 px-4 mb-3`}>
                  <h3 className={`${theme.sectionTitle} font-bold text-sm uppercase`}>
                    Client Project For Attention
                  </h3>
                </div>
                <div className="px-1">
                  {projects.map((project, index) => (
                    <ExperienceItem
                      key={`proj-${index}`}
                      item={project}
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModernResumeTemplate;