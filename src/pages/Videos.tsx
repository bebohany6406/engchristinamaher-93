
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoUploader } from "@/components/VideoUploader";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight } from "lucide-react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

// Fix the isYouTube URL validation function
const isYouTubeURL = (url: string): boolean => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};
