"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [names, setNames] = useState("");
  const [gradientFrom, setGradientFrom] = useState("#1e293b");
  const [gradientTo, setGradientTo] = useState("#334155");
  const [fontSize, setFontSize] = useState([120]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontColor, setFontColor] = useState("#ffffff");
  const [speed, setSpeed] = useState([10]);
  const [pauseBetween, setPauseBetween] = useState([0]);
  const [useAlternateLogo, setUseAlternateLogo] = useState(false);
  const [logoOpacity, setLogoOpacity] = useState([40]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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
        setGradientFrom(config.gradient.from);
        setGradientTo(config.gradient.to);
        setFontSize([config.font.size]);
        setFontFamily(config.font.family);
        setFontColor(config.font.color);
        setSpeed([config.animation.speed]);
        setPauseBetween([config.animation.pauseBetween]);
        setUseAlternateLogo(config.logo?.useAlternate || false);
        setLogoOpacity([config.logo?.opacity || 40]);
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

      const config: Config = {
        title: title,
        names: nameList,
        gradient: {
          from: gradientFrom,
          to: gradientTo,
        },
        font: {
          size: fontSize[0],
          family: fontFamily,
          color: fontColor,
        },
        animation: {
          speed: speed[0],
          pauseBetween: pauseBetween[0],
        },
        logo: {
          useAlternate: useAlternateLogo,
          opacity: logoOpacity[0],
        },
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
        console.log("Config saved to blob URL:", result.url);
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save settings");
      }
    } catch (error) {
      console.error("[v0] Failed to save config:", error);
      setSaveMessage("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Configure the presentation display</p>
          </div>
          <div className="text-red-500 w-[200px] text-right">Save your changes before switching pages!</div>
          <Link href="/names">
            <Button variant="outline">Open Names Panel</Button>
          </Link>
          <Link href="/presentation" target="_blank">
            <Button variant="outline">Open Presentation</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Optional title to display at the top of the screen</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter title text (leave blank for no title)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Names</CardTitle>
            <CardDescription>Enter names to display, one per line</CardDescription>
            <div className="flex items-center justify-end gap-4">
              {saveMessage && (
                <span
                  className={
                    saveMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-destructive"
                  }>
                  {saveMessage}
                </span>
              )}
              <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full md:w-auto">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              rows={8}
              className="font-mono"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Background Gradient</CardTitle>
            <CardDescription>Choose the gradient colors for the presentation background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradientFrom">From Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="gradientFrom"
                    type="color"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={gradientFrom}
                    onChange={(e) => setGradientFrom(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gradientTo">To Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="gradientTo"
                    type="color"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={gradientTo}
                    onChange={(e) => setGradientTo(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div
              className="h-20 rounded-md"
              style={{
                background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Font Settings</CardTitle>
            <CardDescription>Customize the appearance of the names</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="fontSize">Font Size: {fontSize[0]}px</Label>
              <Slider
                id="fontSize"
                min={40}
                max={300}
                step={10}
                value={fontSize}
                onValueChange={setFontSize}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="fontFamily" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Impact">Impact</SelectItem>
                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fontColor">Font Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="fontColor"
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo Settings</CardTitle>
            <CardDescription>Configure the background logo appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useAlternateLogo"
                checked={useAlternateLogo}
                onChange={(e) => setUseAlternateLogo(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                aria-label="Use Alternate Logo"
              />
              <Label htmlFor="useAlternateLogo" className="cursor-pointer">
                Use Alternate Logo (No White Background)
              </Label>
            </div>

            <div>
              <Label htmlFor="logoOpacity">Logo Opacity: {logoOpacity[0]}%</Label>
              <Slider
                id="logoOpacity"
                min={0}
                max={100}
                step={5}
                value={logoOpacity}
                onValueChange={setLogoOpacity}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Animation Settings</CardTitle>
            <CardDescription>Control the timing and speed of the scrolling animation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="speed">Scroll Speed: {speed[0]} seconds</Label>
              <Slider id="speed" min={0} max={30} step={1} value={speed} onValueChange={setSpeed} className="mt-2" />
            </div>

            <div>
              <Label htmlFor="pauseBetween">Pause Between Names: {pauseBetween[0]} seconds</Label>
              <Slider
                id="pauseBetween"
                min={0}
                max={5}
                step={0.5}
                value={pauseBetween}
                onValueChange={setPauseBetween}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full md:w-auto">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {saveMessage && (
            <span
              className={saveMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-destructive"}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
