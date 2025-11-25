import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileText,
  Presentation,
  LogOut,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dailog";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    document_type: "docx",
    topic: "",
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/projects`, newProject);
      toast.success("Project created successfully!");
      setCreateDialogOpen(false);
      setNewProject({ title: "", document_type: "docx", topic: "" });
      navigate(`/projects/${response.data.id}/config`);
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700",
      configured: "bg-blue-100 text-blue-700",
      generating: "bg-yellow-100 text-yellow-700",
      generated: "bg-green-100 text-green-700",
      completed: "bg-purple-100 text-purple-700",
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DeepBlue AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium  text-blue-600">
                  {user?.name}
                </p>
                <p className="text-xs   text-blue-600">{user?.email}</p>
              </div>
              <Button
                data-testid="logout-button"
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline text-red-500">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-600">
            Create and manage your AI-powered documents
          </p>
        </div>

        {/* Create New Project */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="create-project-button"
              size="lg"
              className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white text-gray-900 shadow-2xl border border-gray-200 rounded-xl p-6">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up your AI document generation project
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" data-testid="project-title-label">
                  Project Title
                </Label>
                <Input
                  id="title"
                  data-testid="project-title-input"
                  placeholder="e.g., Q4 Market Analysis"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="document_type"
                  data-testid="document-type-label"
                >
                  Document Type
                </Label>
                <Select
                  value={newProject.document_type}
                  onValueChange={(value) =>
                    setNewProject({ ...newProject, document_type: value })
                  }
                >
                  <SelectTrigger data-testid="document-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="z-[9999] bg-white  shadow-xl border rounded-md"
                  >
                    <SelectItem value="docx">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Word Document (.docx)
                      </div>
                    </SelectItem>

                    <SelectItem value="pptx">
                      <div className="flex items-center gap-2">
                        <Presentation className="w-4 h-4" />
                        PowerPoint (.pptx)
                      </div>
                    </SelectItem>
                  </SelectContent>
                  {/* <SelectPortal>
                    <SelectContent
                      position="popper"
                      className="z-[9999] bg-white dark:bg-neutral-900 shadow-xl border rounded-md"
                    >
                      <SelectItem value="docx">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Word Document (.docx)
                        </div>
                      </SelectItem>

                      <SelectItem value="pptx">
                        <div className="flex items-center gap-2">
                          <Presentation className="w-4 h-4" />
                          PowerPoint (.pptx)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </SelectPortal> */}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic" data-testid="project-topic-label">
                  Topic / Description
                </Label>
                <Input
                  id="topic"
                  data-testid="project-topic-input"
                  placeholder="e.g., Analysis of EV market trends in 2025"
                  value={newProject.topic}
                  onChange={(e) =>
                    setNewProject({ ...newProject, topic: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                data-testid="submit-create-project"
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first AI-powered document project
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                data-testid={`project-card-${project.id}`}
                className="section-card cursor-pointer hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  if (project.status === "draft") {
                    navigate(`/projects/${project.id}/config`);
                  } else {
                    navigate(`/projects/${project.id}/editor`);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {project.document_type === "docx" ? (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Presentation className="w-5 h-5 text-orange-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          data-testid={`delete-project-${project.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.title}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {project.topic}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
