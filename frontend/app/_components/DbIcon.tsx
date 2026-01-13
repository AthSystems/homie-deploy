import DOMPurify from "dompurify";

type DbIconProps = {
    svg: string;
    color?: string;
    className?: string;
};

export function DbIcon({ svg, color, className }: DbIconProps) {
    const cleanSvg = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } });

    return (
        <span
            className={className}
            style={{ color }}
            dangerouslySetInnerHTML={{ __html: cleanSvg }}
        />
    );
}