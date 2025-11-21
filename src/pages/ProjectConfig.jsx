import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Wand2,
  FileText,
  Presentation,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProjectConfig() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}`);
      setProject(response.data);

      // Load existing structure or create initial item
      if (response.data.structure) {
        const structureItems =
          response.data.document_type === "docx"
            ? response.data.structure.sections
            : response.data.structure.slides;
        setItems(structureItems || []);
      } else {
        setItems([{ id: crypto.randomUUID(), title: "", order: 0 }]);
      }
    } catch (error) {
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      title: "",
      order: items.length,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      toast.error("You must have at least one item");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateTitle = (id, title) => {
    setItems(items.map((item) => (item.id === id ? { ...item, title } : item)));
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/suggest-outline`, {
        topic: project.topic,
        document_type: project.document_type,
      });

      const suggestedItems =
        project.document_type === "docx"
          ? response.data.sections
          : response.data.slides;

      setItems(suggestedItems);
      toast.success("AI outline generated successfully!");
    } catch (error) {
      toast.error("Failed to generate AI outline");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    // Validate all items have titles
    if (items.some((item) => !item.title.trim())) {
      toast.error("Please fill in all titles");
      return;
    }

    try {
      const structure =
        project.document_type === "docx"
          ? { sections: items }
          : { slides: items };

      await axios.put(`${API}/projects/${projectId}/structure`, structure);
      toast.success("Structure saved successfully!");
      navigate(`/projects/${projectId}/editor`);
    } catch (error) {
      toast.error("Failed to save structure");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-button"
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
                  <FileText
                    className={`w-6 h-6 ${
                      isDocx ? "text-blue-600" : "text-orange-600"
                    }`}
                  />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Configure{" "}
                  {isDocx ? "Document Sections" : "Presentation Slides"}
                </CardTitle>
                <CardDescription className="mt-2">
                  {isDocx
                    ? "Define the sections for your document. Each section will have AI-generated content."
                    : "Define the slides for your presentation. Each slide will have AI-generated content."}
                </CardDescription>
              </div>
              <Button
                data-testid="ai-suggest-button"
                onClick={handleAISuggest}
                disabled={aiLoading}
                variant="outline"
                className="gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>AI Suggest</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                data-testid={`item-${index}`}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                  {index + 1}
                </div>
                <Input
                  data-testid={`item-title-${index}`}
                  placeholder={isDocx ? "Section title..." : "Slide title..."}
                  value={item.title}
                  onChange={(e) => handleUpdateTitle(item.id, e.target.value)}
                  className="flex-1 bg-white"
                />
                <Button
                  data-testid={`remove-item-${index}`}
                  onClick={() => handleRemoveItem(item.id)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              data-testid="add-item-button"
              onClick={handleAddItem}
              variant="outline"
              className="w-full gap-2 border-dashed"
            >
              <Plus className="w-4 h-4" />
              Add {isDocx ? "Section" : "Slide"}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button
            data-testid="save-continue-button"
            onClick={handleSaveAndContinue}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
          >
            Save & Continue to Generation
          </Button>
        </div>
      </main>
    </div>
  );
}
