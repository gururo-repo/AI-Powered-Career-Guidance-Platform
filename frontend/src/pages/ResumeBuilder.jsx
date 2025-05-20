
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  User,
  FileText,
  Book,
  Briefcase,
  Code,
  ChevronRight,
  AlertTriangle,
  Layout
} from "lucide-react";
import html2pdf from "html2pdf.js";
import ResumeForm from "../components/ResumeForm";
import MDEditor from '@uiw/react-md-editor';
import { FaLightbulb } from 'react-icons/fa';
import { toast } from "react-hot-toast";
import ModernResumeTemplate from "../components/ModernResumeTemplate";

// Schema for resume validation
const resumeSchema = z.object({
  contactInfo: z.object({
    title: z.string().optional(),
    email: z.string().email().optional(),
    mobile: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional()
  }),
  summary: z.string().optional(),
  skills: z.string().optional(),
  experience: z.array(z.any()),
  education: z.array(z.any()),
  projects: z.array(z.any())
});

// Helper function to convert entries to markdown
const entriesToMarkdown = (entries, title) => {
  if (!entries || entries.length === 0) return "";

  const entriesMarkdown = entries.map(entry => {
    const dateRange = entry.current
      ? `${entry.startDate} - Present`
      : `${entry.startDate} - ${entry.endDate}`;

    return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
  }).join("\n\n");

  return `## ${title}\n\n${entriesMarkdown}`;
};

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState("");
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("modern"); // Options: "classic", "modern"
  const [colorTheme, setColorTheme] = useState("blue"); // Options: blue, green, purple, orange, red

  // Sections for navigation
  const sections = [
    { name: "Contact", icon: <User className="h-5 w-5" /> },
    { name: "Summary", icon: <FileText className="h-5 w-5" /> },
    { name: "Skills", icon: <Code className="h-5 w-5" /> },
    { name: "Experience", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Education", icon: <Book className="h-5 w-5" /> },
    { name: "Projects", icon: <Code className="h-5 w-5" /> }
  ];

  const [userData, setUserData] = useState({ name: '' });

  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  // Watch form fields for preview updates
  const formValues = watch();

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent);
    }
  }, [formValues, activeTab]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.github) parts.push(`💻 [GitHub](${contactInfo.github})`);

    return parts.length > 0
      ? `## <div align="center">${userData?.name || 'Your Name'}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15],
        filename: `${userData?.name || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("Resume PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving - replace with actual API call
      setTimeout(() => {
        localStorage.setItem('savedResume', previewContent);
        setIsSaving(false);
        alert("Resume saved successfully");
      }, 1000);
    } catch (error) {
      console.error("Save error:", error);
      setIsSaving(false);
    }
  };

  const scrollToSection = (index) => {
    setActiveSectionIndex(index);
    const sectionElement = document.getElementById(`section-${index}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black py-10">
      <div className="container mx-auto px-4 pt-8">
        <div className="border border-cyan-700/40 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-lg shadow-cyan-900/20 overflow-hidden">
          {/* Header */}
          <div className="border-b border-cyan-800/40 p-6 bg-gradient-to-r from-cyan-900/20 to-zinc-900">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-cyan-50 mb-2">
                  Resume Builder
                </h1>
                <p className="text-cyan-400/80">Create a professional resume in minutes</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={generatePDF}
                  disabled={isGenerating || !previewContent}
                  className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-800 to-cyan-700 hover:from-cyan-700 hover:to-cyan-600 text-white disabled:opacity-50 transition-colors shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={onSave}
                  disabled={isSaving || !previewContent}
                  className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white disabled:opacity-50 transition-colors shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-6">
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-cyan-800/50 p-1 bg-zinc-900/80 shadow-inner">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-4 py-2 rounded-md ${activeTab === "edit"
                      ? "bg-gradient-to-r from-cyan-700 to-cyan-600 text-white shadow-md"
                      : "text-cyan-400 hover:text-cyan-300"
                    } transition-all`}
                >
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 rounded-md ${activeTab === "preview"
                      ? "bg-gradient-to-r from-cyan-700 to-cyan-600 text-white shadow-md"
                      : "text-cyan-400 hover:text-cyan-300"
                    } transition-all`}
                >
                  <Monitor className="h-4 w-4 mr-2 inline" />
                  Preview
                </button>
              </div>
            </div>

            {/* Edit Mode with Side Navigation */}
            {activeTab === "edit" && (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Side Navigation */}
                <div className="md:w-64 flex-shrink-0">
                  <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 rounded-xl border border-cyan-800/30 shadow-lg p-4 sticky top-4">
                    <h3 className="text-lg font-medium text-cyan-50 mb-4 border-b border-cyan-900/30 pb-2">Resume Sections</h3>
                    <nav className="space-y-1">
                      {sections.map((section, index) => (
                        <button
                          key={`section-nav-${section.name}`}
                          onClick={() => scrollToSection(index)}
                          className={`w-full flex items-center p-3 rounded-lg transition-all ${activeSectionIndex === index
                              ? "bg-gradient-to-r from-cyan-800/30 to-cyan-900/30 text-cyan-300 border-l-4 border-cyan-500"
                              : "text-cyan-100 hover:bg-zinc-800"
                            }`}
                        >
                          <span className="inline-block mr-3">{section.icon}</span>
                          <span>{section.name}</span>
                          <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${activeSectionIndex === index ? "text-cyan-400 transform rotate-90" : ""}`} />
                        </button>
                      ))}
                    </nav>
                    <div className="mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-800/30">
                      <h4 className="text-cyan-300 font-medium flex items-center">
                        <FaLightbulb className="mr-2 text-yellow-400" /> Pro Tip
                      </h4>
                      <p className="text-cyan-100/80 text-sm mt-2">
                        Tailor your resume to each job by highlighting relevant skills and experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Sections */}
                <div className="flex-grow space-y-8">
                  {/* Contact Information */}
                  <div id="section-0" className="space-y-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-cyan-800/30 shadow-lg">
                    <h3 className="text-xl font-medium text-cyan-300 border-b border-cyan-900/30 pb-2 flex items-center">
                      <User className="h-5 w-5 mr-2 text-cyan-400" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="fullName" className="text-sm text-cyan-400 font-medium">Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          placeholder="Your Full Name"
                          value={userData.name}
                          onChange={(e) => {
                            const newUserData = { ...userData, name: e.target.value };
                            setUserData(newUserData);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="title" className="text-sm text-cyan-400 font-medium">Professional Title</label>
                        <input
                          id="title"
                          type="text"
                          placeholder="e.g. Senior Software Engineer"
                          {...register("contactInfo.title")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm text-cyan-400 font-medium">Email</label>
                        <input
                          id="email"
                          type="email"
                          placeholder="Email"
                          {...register("contactInfo.email")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                        {errors.contactInfo?.email && (
                          <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="mobile" className="text-sm text-cyan-400 font-medium">Mobile</label>
                        <input
                          id="mobile"
                          type="text"
                          placeholder="Mobile"
                          {...register("contactInfo.mobile")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm text-cyan-400 font-medium">Location</label>
                        <input
                          id="location"
                          type="text"
                          placeholder="City, Country"
                          {...register("contactInfo.location")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="website" className="text-sm text-cyan-400 font-medium">Website</label>
                        <input
                          id="website"
                          type="url"
                          placeholder="https://yourwebsite.com"
                          {...register("contactInfo.website")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="linkedin" className="text-sm text-cyan-400 font-medium">LinkedIn</label>
                        <input
                          id="linkedin"
                          type="url"
                          placeholder="LinkedIn URL or username"
                          {...register("contactInfo.linkedin")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="github" className="text-sm text-cyan-400 font-medium">GitHub</label>
                        <input
                          id="github"
                          type="url"
                          placeholder="GitHub URL or username"
                          {...register("contactInfo.github")}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div id="section-1" className="space-y-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-cyan-800/30 shadow-lg">
                    <h3 className="text-xl font-medium text-cyan-300 border-b border-cyan-900/30 pb-2 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-cyan-400" />
                      Professional Summary
                    </h3>
                    <div className="space-y-2">
                      <label htmlFor="summary" className="text-sm text-cyan-400 font-medium">Summary</label>
                      <textarea
                        id="summary"
                        placeholder="Write a brief summary of your professional background and goals"
                        {...register("summary")}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                      ></textarea>
                    </div>
                  </div>

                  {/* Skills */}
                  <div id="section-2" className="space-y-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-cyan-800/30 shadow-lg">
                    <h3 className="text-xl font-medium text-cyan-300 border-b border-cyan-900/30 pb-2 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-cyan-400" />
                      Skills
                    </h3>
                    <div className="space-y-2">
                      <label htmlFor="skills" className="text-sm text-cyan-400 font-medium">Technical Skills</label>
                      <textarea
                        id="skills"
                        placeholder="List your key skills, separated by commas"
                        {...register("skills")}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-cyan-800/50 text-cyan-50 placeholder:text-zinc-600 focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all"
                      ></textarea>
                    </div>
                  </div>

                  {/* Experience */}
                  <div id="section-3" className="space-y-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-cyan-800/30 shadow-lg">
                    <h3 className="text-xl font-medium text-cyan-300 border-b border-cyan-900/30 pb-2 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-cyan-400" />
                      Work Experience
                    </h3>
                    <Controller
                      name="experience"
                      control={control}
                      render={({ field }) => (
                        <ResumeForm
                          entries={field.value}
                          onChange={field.onChange}
                          defaultEntry={{
                            title: "",
                            organization: "",
                            startDate: "",
                            endDate: "",
                            current: false,
                            description: ""
                          }}
                          title="Experience"
                        />
                      )}
                    />
                  </div>

                  {/* Education */}
                  <div id="section-4" className="space-y-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-cyan-800/30 shadow-lg">
                    <h3 className="text-xl font-medium text-cyan-300 border-b border-cyan-900/30 pb-2 flex items-center">
                      <Book className="h-5 w-5 mr-2 text-cyan-400" />
                      Education
                    </h3>
                    <Controller
                      name="education"
                      control={control}
                      render={({ field }) => (
                        <ResumeForm
                          entries={field.value}
                          onChange={field.onChange}
                          defaultEntry={{
                            title: "",
                            organization: "",
                            startDate: "",
                            endDate: "",
                            current: false,
                            description: ""
                          }}
                          title="Education"
                        />
                      )}
                    />
                  </div>

                  {/* Projects */}
                  <div id="section-5" className="space-y-4 bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-cyan-800/30 shadow-lg">
                    <h3 className="text-xl font-medium text-cyan-300 border-b border-cyan-900/30 pb-2 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-cyan-400" />
                      Projects
                    </h3>
                    <Controller
                      name="projects"
                      control={control}
                      render={({ field }) => (
                        <ResumeForm
                          entries={field.value}
                          onChange={field.onChange}
                          defaultEntry={{
                            title: "",
                            organization: "",
                            startDate: "",
                            endDate: "",
                            current: false,
                            description: ""
                          }}
                          title="Projects"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preview Mode */}

            {activeTab === "preview" && (
              <div className="space-y-4">
                {/* Template Selection */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-cyan-300 mb-2">Template Style</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTemplate("classic")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          selectedTemplate === "classic"
                            ? "bg-gradient-to-r from-cyan-700 to-cyan-600 text-white"
                            : "bg-zinc-800 text-cyan-400 hover:bg-zinc-700"
                        }`}
                      >
                        <Layout className="h-4 w-4" />
                        Classic
                      </button>
                      <button
                        onClick={() => setSelectedTemplate("modern")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          selectedTemplate === "modern"
                            ? "bg-gradient-to-r from-cyan-700 to-cyan-600 text-white"
                            : "bg-zinc-800 text-cyan-400 hover:bg-zinc-700"
                        }`}
                      >
                        <Layout className="h-4 w-4" />
                        Modern
                      </button>
                    </div>
                  </div>

                  {selectedTemplate === "modern" && (
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-cyan-300 mb-2">Color Theme</h3>
                      <div className="flex flex-wrap gap-2">
                        {["blue", "green", "purple", "orange", "red"].map((color) => {
                          // Determine color class based on color name
                          const getColorClass = (colorName) => {
                            switch(colorName) {
                              case "blue": return "bg-blue-600";
                              case "green": return "bg-emerald-600";
                              case "purple": return "bg-purple-600";
                              case "orange": return "bg-orange-600";
                              case "red": return "bg-red-600";
                              default: return "bg-blue-600";
                            }
                          };

                          return (
                            <button
                              key={color}
                              onClick={() => setColorTheme(color)}
                              className={`w-8 h-8 rounded-full ${
                                colorTheme === color ? "ring-2 ring-white" : ""
                              } ${getColorClass(color)}`}
                              aria-label={`${color} theme`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Classic Template Preview */}
                {selectedTemplate === "classic" && (
                  <>
                    {/* Classic template controls */}
                    <div className="flex justify-between items-center mb-4">
                      <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-800 to-cyan-700 hover:from-cyan-700 hover:to-cyan-600 text-white transition-colors shadow-md flex items-center gap-2"
                        onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
                      >
                        {resumeMode === "preview" ? (
                          <>
                            <Edit className="h-4 w-4" />
                            Edit Resume
                          </>
                        ) : (
                          <>
                            <Monitor className="h-4 w-4" />
                            Show Preview
                          </>
                        )}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={generatePDF}
                          disabled={isGenerating || !previewContent}
                          className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-800 to-cyan-700 hover:from-cyan-700 hover:to-cyan-600 text-white disabled:opacity-50 transition-colors shadow-md"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {resumeMode !== "preview" && (
                      <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">
                          You will lose edited markdown if you update the form data.
                        </span>
                      </div>
                    )}

                    {/* MDEditor integration with white background and black text */}
                    <div className="border rounded-lg">
                      <MDEditor
                        value={previewContent}
                        onChange={setPreviewContent}
                        height={800}
                        preview={resumeMode}
                        previewOptions={{
                          className: "bg-white text-black w-full h-full",
                          style: {
                            backgroundColor: "white",
                            color: "black",
                            padding: "20px"
                          }
                        }}
                        visibleDragbar={false}
                        style={{ backgroundColor: resumeMode === "preview" ? "white" : undefined }}
                      />
                    </div>

                    {/* Hidden div for PDF generation */}
                    <div className="hidden">
                      <div id="resume-pdf">
                        <MDEditor.Markdown
                          source={previewContent}
                          style={{
                            background: "white",
                            color: "black",
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Modern Template Preview */}
                {selectedTemplate === "modern" && (
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Modern Resume Preview</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={generatePDF}
                          disabled={isGenerating}
                          className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-800 to-cyan-700 hover:from-cyan-700 hover:to-cyan-600 text-white disabled:opacity-50 transition-colors shadow-md"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Modern Resume Template */}
                    <div className="border rounded-lg overflow-hidden" id="resume-pdf">
                      <ModernResumeTemplate
                        resumeData={{
                          name: userData?.name || 'Your Name',
                          title: formValues?.contactInfo?.title || 'Professional Title',
                          contactInfo: formValues.contactInfo,
                          summary: formValues.summary,
                          skills: formValues.skills,
                          experience: formValues.experience,
                          education: formValues.education,
                          projects: formValues.projects,
                          certificates: formValues.certificates
                        }}
                        colorTheme={colorTheme}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}