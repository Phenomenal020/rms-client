import Image from "next/image";

const MOBILE_SIZE = 1000;
const DESKTOP_WIDTH = 1600;
const DESKTOP_HEIGHT = 1000;

const STAGE_ASSETS: Record<
  PipelineStageMockKey,
  { mobile: string; desktop: string; alt: string }
> = {
  setup: {
    mobile: "/pipeline-setup-enhanced-mobile.png",
    desktop: "/pipeline-setup-enhanced.png",
    alt: "Setup",
  },
  grading: {
    mobile: "/pipeline-grading-enhanced-mobile.png",
    desktop: "/pipeline-grading-enhanced.png",
    alt: "Grading",
  },
  enrollment: {
    mobile: "/pipeline-enrollment-enhanced-mobile.png",
    desktop: "/pipeline-enrollment-enhanced.png",
    alt: "Enrollment",
  },
  output: {
    mobile: "/pipeline-output-enhanced-mobile.png",
    desktop: "/pipeline-output-enhanced.png",
    alt: "Output",
  },
  compliance: {
    mobile: "/pipeline-compliance-enhanced-mobile.png",
    desktop: "/pipeline-compliance-enhanced.png",
    alt: "Compliance",
  },
};

function PipelineStageImage({
  mobileSrc,
  desktopSrc,
  alt,
}: {
  mobileSrc: string;
  desktopSrc: string;
  alt: string;
}) {
  return (
    <div className="w-full">
      {/* xs + sm: square mobile asset, scales down with container (max 1000px) */}
      <Image
        src={mobileSrc}
        alt={alt}
        width={MOBILE_SIZE}
        height={MOBILE_SIZE}
        sizes="100vw"
        className="h-auto w-full max-w-[1000px] rounded-lg md:hidden"
      />
      {/* md+: desktop asset 1600×1000, scales down if container is narrower */}
      <Image
        src={desktopSrc}
        alt={alt}
        width={DESKTOP_WIDTH}
        height={DESKTOP_HEIGHT}
        sizes="(min-width: 768px) 1600px"
        className="hidden h-auto w-full max-w-[1600px] rounded-lg md:block"
      />
    </div>
  );
}

export function StageMock({ mockKey }: { mockKey: PipelineStageMockKey }) {
  const assets = STAGE_ASSETS[mockKey];
  return (
    <PipelineStageImage
      mobileSrc={assets.mobile}
      desktopSrc={assets.desktop}
      alt={assets.alt}
    />
  );
}

export type PipelineStageMockKey = "setup" | "grading" | "enrollment" | "output" | "compliance";
