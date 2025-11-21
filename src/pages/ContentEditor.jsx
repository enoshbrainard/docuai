import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Presentation,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordian";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ContentEditor() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState({});
  const [refinementPrompts, setRefinementPrompts] = useState({});
  const [comments, setComments] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchContent();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/content`);
      const contentMap = {};
      response.data.content.forEach((item) => {
        contentMap[item.section_id] = item;
      });
      setContent(contentMap);
    } catch (error) {
      console.error("Failed to fetch content", error);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await axios.post(`${API}/projects/${projectId}/generate`);
      toast.success("Content generated successfully!");
      await fetchContent();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async (sectionId) => {
    const prompt = refinementPrompts[sectionId];
    if (!prompt || !prompt.trim()) {
      toast.error("Please enter a refinement prompt");
      return;
    }

    setRefining({ ...refining, [sectionId]: true });
    try {
      const response = await axios.post(`${API}/projects/${projectId}/refine`, {
        section_id: sectionId,
        prompt: prompt,
      });

      // Update content with refined version
      setContent({
        ...content,
        [sectionId]: {
          ...content[sectionId],
          content: response.data.content,
          version: response.data.version,
        },
      });

      // Clear refinement prompt
      setRefinementPrompts({ ...refinementPrompts, [sectionId]: "" });
      toast.success("Content refined successfully!");
    } catch (error) {
      toast.error("Failed to refine content");
    } finally {
      setRefining({ ...refining, [sectionId]: false });
    }
  };

  const handleFeedback = async (sectionId, feedbackType) => {
    try {
      await axios.post(`${API}/projects/${projectId}/feedback`, {
        section_id: sectionId,
        feedback_type: feedbackType,
        comment: comments[sectionId] || null,
      });

      setFeedbacks({ ...feedbacks, [sectionId]: feedbackType });
      toast.success(`Feedback submitted: ${feedbackType}`);
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/projects/${projectId}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const extension = project.document_type;
      link.setAttribute(
        "download",
        `${project.title.replace(/ /g, "_")}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Document exported successfully!");
    } catch (error) {
      toast.error("Failed to export document");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isDocx = project.document_type === "docx";
  const items = isDocx
    ? project.structure?.sections
    : project.structure?.slides;
  const hasContent = Object.keys(content).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                data-testid="back-to-dashboard"
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${
                    isDocx ? "bg-blue-100" : "bg-orange-100"
                  } rounded-lg flex items-center justify-center`}
                >
                  {isDocx ? (
                    <FileText className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Presentation className="w-6 h-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {project.title}
                  </h1>
                  <p className="text-sm text-gray-600">{project.topic}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!hasContent ? (
                <Button
                  data-testid="generate-content-button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Content</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  data-testid="export-document-button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasContent ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="w-16 h-16 mx-auto text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Generate Content
              </h3>
              <p className="text-gray-600 mb-6">
                Click the "Generate Content" button to create AI-powered content
                for your {isDocx ? "document" : "presentation"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Accordion
              type="multiple"
              className="space-y-4"
              defaultValue={items?.map((_, i) => `item-${i}`)}
            >
              {items?.map((item, index) => {
                const sectionContent = content[item.id];
                const hasFeedback = feedbacks[item.id];

                return (
                  <AccordionItem
                    key={item.id}
                    value={`item-${index}`}
                    data-testid={`content-section-${index}`}
                    className="bg-white rounded-xl shadow-md border-0 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full text-sm font-bold text-white shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.title}
                          </h3>
                          {sectionContent && (
                            <p className="text-xs text-gray-500 mt-1">
                              Version {sectionContent.version}
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {sectionContent ? (
                        <div className="space-y-4">
                          {/* Content Display */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {sectionContent.content}
                            </p>
                          </div>

                          {/* Refinement Section */}
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">
                              Refine this content:
                            </label>
                            <div className="flex gap-2">
                              <Textarea
                                data-testid={`refinement-prompt-${index}`}
                                placeholder="e.g., Make this more formal, Add bullet points, Shorten to 100 words..."
                                value={refinementPrompts[item.id] || ""}
                                onChange={(e) =>
                                  setRefinementPrompts({
                                    ...refinementPrompts,
                                    [item.id]: e.target.value,
                                  })
                                }
                                className="flex-1 min-h-[80px]"
                              />
                              <Button
                                data-testid={`refine-button-${index}`}
                                onClick={() => handleRefine(item.id)}
                                disabled={refining[item.id]}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                              >
                                {refining[item.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Feedback Section */}
                          <div className="space-y-3 pt-4 border-t border-gray-200">
                            <label className="text-sm font-medium text-gray-700">
                              Your feedback:
                            </label>
                            <div className="flex items-center gap-3">
                              <Button
                                data-testid={`like-button-${index}`}
                                onClick={() => handleFeedback(item.id, "like")}
                                variant={
                                  hasFeedback === "like" ? "default" : "outline"
                                }
                                size="sm"
                                className={`gap-2 ${
                                  hasFeedback === "like"
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : ""
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Like
                              </Button>
                              <Button
                                data-testid={`dislike-button-${index}`}
                                onClick={() =>
                                  handleFeedback(item.id, "dislike")
                                }
                                variant={
                                  hasFeedback === "dislike"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className={`gap-2 ${
                                  hasFeedback === "dislike"
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : ""
                                }`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                                Dislike
                              </Button>
                              <div className="flex-1 flex gap-2">
                                <Textarea
                                  data-testid={`comment-input-${index}`}
                                  placeholder="Add a comment (optional)..."
                                  value={comments[item.id] || ""}
                                  onChange={(e) =>
                                    setComments({
                                      ...comments,
                                      [item.id]: e.target.value,
                                    })
                                  }
                                  className="flex-1 min-h-[60px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No content generated yet</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </main>
    </div>
  );
}
