"use client";

import Color from "color";
import { PipetteIcon } from "lucide-react";
import { Slider } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ColorPickerContextValue = {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  mode: string;
  setHue: (hue: number) => void;
  setSaturation: (saturation: number) => void;
  setLightness: (lightness: number) => void;
  setAlpha: (alpha: number) => void;
  setMode: (mode: string) => void;
};

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
);

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);

  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider");
  }

  return context;
};

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0];
  defaultValue?: Parameters<typeof Color>[0];
  onChange?: (value: Parameters<typeof Color.rgb>[0]) => void;
};

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const selectedColor = Color(value);
  const defaultColor = Color(defaultValue);

  const [hue, setHue] = useState(
    selectedColor.hue() || defaultColor.hue() || 0
  );
  const [saturation, setSaturation] = useState(
    selectedColor.saturationl() || defaultColor.saturationl() || 100
  );
  const [lightness, setLightness] = useState(
    selectedColor.lightness() || defaultColor.lightness() || 50
  );
  const [alpha, setAlpha] = useState(
    selectedColor.alpha() * 100 || defaultColor.alpha() * 100
  );
  const [mode, setMode] = useState("hex");

  // Update color when controlled value changes
  useEffect(() => {
    if (value) {
      const color = Color.rgb(value).rgb().object();

      setHue(color.r);
      setSaturation(color.g);
      setLightness(color.b);
      setAlpha(color.a);
    }
  }, [value]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
      const rgba = color.rgb().array();

      onChange([rgba[0], rgba[1], rgba[2], alpha / 100]);
    }
  }, [hue, saturation, lightness, alpha, onChange]);

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div
        className={cn("flex size-full flex-col gap-4", className)}
        {...props}
      />
    </ColorPickerContext.Provider>
  );
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerSelection = memo(
  ({ className, ...props }: ColorPickerSelectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);
    const { hue, setSaturation, setLightness } = useColorPicker();

    const backgroundGradient = useMemo(() => {
      return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`;
    }, [hue]);

    const handlePointerMove = useCallback(
      (event: PointerEvent) => {
        if (!(isDragging && containerRef.current)) {
          return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        );
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - rect.top) / rect.height)
        );
        setPositionX(x);
        setPositionY(y);
        setSaturation(x * 100);
        const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
        const lightness = topLightness * (1 - y);

        setLightness(lightness);
      },
      [isDragging, setSaturation, setLightness]
    );

    useEffect(() => {
      const handlePointerUp = () => setIsDragging(false);

      if (isDragging) {
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
      }

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }, [isDragging, handlePointerMove]);

    return (
      <div
        className={cn("relative size-full cursor-crosshair rounded", className)}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          handlePointerMove(e.nativeEvent);
        }}
        ref={containerRef}
        style={{
          background: backgroundGradient,
        }}
        {...props}
      >
        <div
          className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white"
          style={{
            left: `${positionX * 100}%`,
            top: `${positionY * 100}%`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    );
  }
);

ColorPickerSelection.displayName = "ColorPickerSelection";

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>;

export const ColorPickerHue = ({
  className,
  ...props
}: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker();

  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={360}
      onValueChange={([hue]) => setHue(hue)}
      step={1}
      value={[hue]}
      {...props}
    >
      <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Slider.Range className="absolute h-full" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  );
};

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>;

export const ColorPickerAlpha = ({
  className,
  ...props
}: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker();

  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={100}
      onValueChange={([alpha]) => setAlpha(alpha)}
      step={1}
      value={[alpha]}
      {...props}
    >
      <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] bg-center bg-repeat-x dark:bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALklEQVR4nGP8+vWrCAMewM3N/QafPBM+SWLAqAGDwQBGQgoIpZOB98KoAVQwAADxzQcSVIRCfQAAAABJRU5ErkJggg==')]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/50 dark:to-white/50" />
        <Slider.Range className="absolute h-full rounded-full bg-transparent" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  );
};

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

export const ColorPickerEyeDropper = ({
  className,
  ...props
}: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker();

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const color = Color(result.sRGBHex);
      const [h, s, l] = color.hsl().array();

      setHue(h);
      setSaturation(s);
      setLightness(l);
      setAlpha(100);
    } catch (error) {
      console.error("EyeDropper failed:", error);
    }
  };

  return (
    <Button
      className={cn("shrink-0 text-muted-foreground", className)}
      onClick={handleEyeDropper}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  );
};

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ["hex", "rgb", "css", "hsl"];

export const ColorPickerOutput = ({
  className,
  ...props
}: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker();

  return (
    <Select onValueChange={setMode} value={mode}>
      <SelectTrigger className="h-8 w-20 shrink-0 text-xs" {...props}>
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem className="text-xs" key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type PercentageInputProps = ComponentProps<typeof Input>;

const PercentageInput = ({ className, ...props }: PercentageInputProps) => {
  return (
    <div className="relative">
      <Input
        type="text"
        {...props}
        className={cn(
          "h-8 w-[3.25rem] rounded-l-none bg-input px-2 text-xs shadow-none",
          className
        )}
      />
      <span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-xs">
        %
      </span>
    </div>
  );
};

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerFormat = ({
  className,
  ...props
}: ColorPickerFormatProps) => {
  const { hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness, setAlpha } =
    useColorPicker();
  const color = Color.hsl(hue, saturation, lightness, alpha / 100);

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  const toNum = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const [hexDraft, setHexDraft] = useState(color.hex());
  const [cssDraft, setCssDraft] = useState(
    `rgba(${color.rgb().array().map((v) => Math.round(v)).join(", ")}, ${alpha}%)`
  );
  const [rgbDraft, setRgbDraft] = useState<[string, string, string]>(() => {
    const [r, g, b] = color
      .rgb()
      .array()
      .map((v) => String(Math.round(v)));
    return [r, g, b];
  });
  const [hslDraft, setHslDraft] = useState<[string, string, string]>(() => {
    const [h, s, l] = color
      .hsl()
      .array()
      .map((v) => String(Math.round(v)));
    return [h, s, l];
  });
  const [alphaDraft, setAlphaDraft] = useState(String(Math.round(alpha)));

  // Mantém inputs sincronizados quando sliders mudarem
  useEffect(() => {
    setHexDraft(color.hex());
    const rgbArr = color
      .rgb()
      .array()
      .map((v) => Math.round(v));
    setCssDraft(`rgba(${rgbArr.join(", ")}, ${alpha}%)`);
    setRgbDraft([String(rgbArr[0]), String(rgbArr[1]), String(rgbArr[2])]);
    const hslArr = color
      .hsl()
      .array()
      .map((v) => Math.round(v));
    setHslDraft([String(hslArr[0]), String(hslArr[1]), String(hslArr[2])]);
    setAlphaDraft(String(Math.round(alpha)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness, alpha]);

  const aplicarColor = (next: ReturnType<typeof Color>) => {
    const [h, s, l] = next.hsl().array();
    setHue(clamp(h, 0, 360));
    setSaturation(clamp(s, 0, 100));
    setLightness(clamp(l, 0, 100));
    setAlpha(clamp(next.alpha() * 100, 0, 100));
  };

  const aplicarAlpha = (val: string) => {
    setAlphaDraft(val);
    const n = toNum(val);
    if (n === null) return;
    setAlpha(clamp(n, 0, 100));
  };

  if (mode === "hex") {
    const handleHexChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const v = e.target.value;
      setHexDraft(v);
      try {
        // aceita "#fff", "#ffffff", "fff", etc.
        const parsed = Color(v.startsWith("#") ? v : `#${v}`);
        aplicarColor(parsed);
      } catch {
        // mantém draft até ficar válido
      }
    };

    return (
      <div
        className={cn(
          "-space-x-px relative flex w-full items-center rounded-md shadow-sm",
          className
        )}
        {...props}
      >
        <Input
          className="h-8 rounded-r-none bg-input px-2 text-xs shadow-none"
          type="text"
          value={hexDraft}
          onChange={handleHexChange}
        />
        <PercentageInput value={alphaDraft} onChange={(e) => aplicarAlpha(e.target.value)} />
      </div>
    );
  }

  if (mode === "rgb") {
    const handleRgbChange = (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setRgbDraft((prev) => {
        const next: [string, string, string] = [...prev] as any;
        next[index] = v;
        return next;
      });

      const r = toNum(index === 0 ? v : rgbDraft[0]);
      const g = toNum(index === 1 ? v : rgbDraft[1]);
      const b = toNum(index === 2 ? v : rgbDraft[2]);
      if (r === null || g === null || b === null) return;

      try {
        const next = Color.rgb(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)).alpha(
          clamp(Number(alpha) / 100, 0, 1)
        );
        aplicarColor(next);
      } catch {
        // ignora enquanto inválido
      }
    };

    return (
      <div
        className={cn(
          "-space-x-px flex items-center rounded-md shadow-sm",
          className
        )}
        {...props}
      >
        {rgbDraft.map((value, index) => (
          <Input
            className={cn(
              "h-8 rounded-r-none bg-input px-2 text-xs shadow-none",
              index && "rounded-l-none",
              className
            )}
            key={index}
            type="text"
            value={value}
            onChange={handleRgbChange(index as 0 | 1 | 2)}
          />
        ))}
        <PercentageInput value={alphaDraft} onChange={(e) => aplicarAlpha(e.target.value)} />
      </div>
    );
  }

  if (mode === "css") {
    const handleCssChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const v = e.target.value;
      setCssDraft(v);
      try {
        const next = Color(v);
        aplicarColor(next);
      } catch {
        // mantém draft
      }
    };

    return (
      <div className={cn("w-full rounded-md shadow-sm", className)} {...props}>
        <Input
          className="h-8 w-full bg-input px-2 text-xs shadow-none"
          type="text"
          value={cssDraft}
          onChange={handleCssChange}
          {...props}
        />
      </div>
    );
  }

  if (mode === "hsl") {
    const handleHslChange = (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setHslDraft((prev) => {
        const next: [string, string, string] = [...prev] as any;
        next[index] = v;
        return next;
      });

      const h = toNum(index === 0 ? v : hslDraft[0]);
      const s = toNum(index === 1 ? v : hslDraft[1]);
      const l = toNum(index === 2 ? v : hslDraft[2]);
      if (h === null || s === null || l === null) return;

      try {
        const next = Color.hsl(clamp(h, 0, 360), clamp(s, 0, 100), clamp(l, 0, 100)).alpha(
          clamp(Number(alpha) / 100, 0, 1)
        );
        aplicarColor(next);
      } catch {
        // ignora enquanto inválido
      }
    };

    return (
      <div
        className={cn(
          "-space-x-px flex items-center rounded-md shadow-sm",
          className
        )}
        {...props}
      >
        {hslDraft.map((value, index) => (
          <Input
            className={cn(
              "h-8 rounded-r-none bg-input px-2 text-xs shadow-none",
              index && "rounded-l-none",
              className
            )}
            key={index}
            type="text"
            value={value}
            onChange={handleHslChange(index as 0 | 1 | 2)}
          />
        ))}
        <PercentageInput value={alphaDraft} onChange={(e) => aplicarAlpha(e.target.value)} />
      </div>
    );
  }

  return null;
};
