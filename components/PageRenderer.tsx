"use client";

import HeroSlider from "./sections/HeroSlider";
import ProductCarousel from "./sections/ProductCarousel";
import TextBlock from "./sections/TextBlock";
import ImageGrid from "./sections/ImageGrid";
import ImageBanner from "./sections/ImageBanner";
import HorizontalScrollCards from "./sections/HorizontalScrollCards";
import ProductHorizontalScroll from "./sections/ProductHorizontalScroll";
import ImageProductCarousel from "./sections/ImageProductCarousel";
import AnnouncementMarquee from "./sections/AnnouncementMarquee";
import FeatureHighlights from "./sections/FeatureHighlights";
import CategoryGrid from "./sections/CategoryGrid";
import SplitBanner from "./sections/SplitBanner";
import NewsletterSignup from "./sections/NewsletterSignup";
import VideoBanner from "./sections/VideoBanner";
import TestimonialsSlider from "./sections/TestimonialsSlider";
import CountdownTimer from "./sections/CountdownTimer";

const sectionComponents: any = {
    hero_slider: HeroSlider,
    product_carousel: ProductCarousel,
    text_block: TextBlock,
    image_grid: ImageGrid,
    image_banner: ImageBanner,
    vertical_scroll_cards: HorizontalScrollCards,
    horizontal_scroll_cards: HorizontalScrollCards,
    product_vertical_scroll: ProductHorizontalScroll,
    product_horizontal_scroll: ProductHorizontalScroll,
    image_product_carousel: ImageProductCarousel,
    announcement_marquee: AnnouncementMarquee,
    feature_highlights: FeatureHighlights,
    category_grid: CategoryGrid,
    split_banner: SplitBanner,
    newsletter_signup: NewsletterSignup,
    video_banner: VideoBanner,
    testimonials_slider: TestimonialsSlider,
    countdown_timer: CountdownTimer,
};

const paddingMap: any = {
    none: 'py-0',
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-16',
    xl: 'py-24',
};

export default function PageRenderer({ content, layout = 'default', settings = {} }: { content: any[]; layout?: string; settings?: any }) {
    if (!content || !Array.isArray(content)) return null;

    const pageOverride = layout || 'default';
    const globalDefault = settings.default_page_layout || 'contained';
    const isFluid = pageOverride === 'fluid' || (pageOverride === 'default' && globalDefault === 'fluid');

    return (
        <div className={isFluid ? 'w-full' : 'max-w-7xl mx-auto'}>
            {content.map((section, index) => {
                if (section.type === 'page_meta') return null;

                const Component = sectionComponents[section.type];
                if (!Component) {
                    console.warn(`Unknown component type: ${section.type}`);
                    return null;
                }

                // Per-section settings
                const s = section.settings || {};
                const bgColor = s.bg_color || '';
                const extraPadding = paddingMap[s.padding] || '';
                const showMobile = s.show_mobile !== false;
                const showDesktop = s.show_desktop !== false;

                let visibilityClass = '';
                if (!showMobile && !showDesktop) visibilityClass = 'hidden';
                else if (!showMobile) visibilityClass = 'hidden md:block';
                else if (!showDesktop) visibilityClass = 'block md:hidden';

                const wrapperClass = [extraPadding, visibilityClass].filter(Boolean).join(' ');

                return (
                    <div
                        key={index}
                        className={wrapperClass || undefined}
                        style={bgColor ? { backgroundColor: bgColor } : undefined}
                    >
                        <Component data={section.data} isFluid={isFluid} sectionBg={bgColor} />
                    </div>
                );
            })}
        </div>
    );
}
