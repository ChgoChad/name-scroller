"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Config {
  title: string;
  names: string[];
  gradient: {
    from: string;
    to: string;
  };
  font: {
    size: number;
    family: string;
    color: string;
  };
  animation: {
    speed: number;
    pauseBetween: number;
  };
  logo: {
    useAlternate: boolean;
    opacity: number;
  };
}

export default function NamesPage() {
  const [title, setTitle] = useState("");
  const [names, setNames] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [existingConfig, setExistingConfig] = useState<Config | null>(null);

  // Load initial config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/get-config", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const config: Config = await response.json();
        setTitle(config.title || "");
        setNames(config.names.join("\n"));
        setExistingConfig(config);
      } catch (error) {
        console.error("[v0] Failed to load config:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const nameList = names
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      if (nameList.length === 0) {
        setSaveMessage("Please add at least one name");
        setIsSaving(false);
        return;
      }

      if (!existingConfig) {
        setSaveMessage("Config not loaded yet");
        setIsSaving(false);
        return;
      }

      // Preserve all existing settings, only update title and names
      const config: Config = {
        ...existingConfig,
        title: title,
        names: nameList,
      };

      // Save config via API
      const response = await fetch("/api/blob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Names saved to blob URL:", result.url);
        setSaveMessage("Names saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save names");
      }
    } catch (error) {
      console.error("[v0] Failed to save names:", error);
      setSaveMessage("Error saving names");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Update Names</h1>
            <p className="text-muted-foreground">Edit the title and names to display</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Open Admin Panel</Button>
          </Link>
          <Link href="/presentation" target="_blank">
            <Button variant="outline">Open Presentation</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Names</CardTitle>
            <CardDescription>Enter names to display, one per line</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              rows={12}
              className="font-mono"
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full md:w-auto">
            {isSaving ? "Saving..." : "Save Names"}
          </Button>
          {saveMessage && (
            <span
              className={saveMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-destructive"}>
              {saveMessage}
            </span>
          )}
        </div>
        <div>Enter/edit the items in the list above and then click SAVE. The name scroll will be updated within 5 secons to include any changes.</div>
      </div>
    </div>
  );
}
