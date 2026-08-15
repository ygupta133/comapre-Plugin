<?php
if (!defined('ABSPATH')) {
    exit;
}

class Yogesh_Headless_Seed {

    public static function run() {
        self::seed_site_settings();
        self::seed_nav_items();
        self::seed_footer_items();
        self::seed_inquiry_types();
        self::seed_hero();
        self::seed_text_items('yg_trust_item', [
            'On-Time Delivery', 'Quality Work', 'Budget Friendly', '100% Satisfaction',
        ]);
        self::seed_text_items('yg_why_choose', [
            '14+ Years of Experience', 'Clean & Modern Code', 'SEO & Performance Focused',
            'Mobile Responsive Design', 'Support & Maintenance', 'Long Term Partnership',
        ]);
        self::seed_services();
        self::seed_stats();
        self::seed_cities();
        self::seed_regions();
        self::seed_engagement();
        self::seed_about();
        self::seed_skills();
        self::seed_experience();
        self::seed_page_seo();
        self::seed_projects();
        self::seed_testimonials();
        update_option('yg_headless_seeded', YG_HEADLESS_VERSION);
    }

    private static function is_empty($post_type) {
        $count = wp_count_posts($post_type);
        return !$count || (int) $count->publish === 0;
    }

    private static function create_post($post_type, $title, $content = '', $meta = []) {
        $id = wp_insert_post([
            'post_type'   => $post_type,
            'post_title'  => $title,
            'post_content'=> $content,
            'post_status' => 'publish',
        ], true);
        if (is_wp_error($id)) {
            return 0;
        }
        foreach ($meta as $key => $val) {
            update_post_meta($id, $key, $val);
        }
        return $id;
    }

    private static function seed_site_settings() {
        if (!self::is_empty('yg_site_settings')) return;
        self::create_post('yg_site_settings', 'Site Settings', '', [
            'site_name' => 'Yogesh Gupta',
            'site_tagline' => 'Freelance Web Developer',
            'cta_text' => 'Hire Me',
            'footer_bio' => 'I am Yogesh Gupta, a freelance web developer with 14+ years of experience building websites, WordPress solutions, Laravel apps and modern React applications.',
            'footer_copyright' => 'Yogesh Gupta. All Rights Reserved.',
            'phone' => '+91 98765 43210',
            'phone_us' => '+1 (555) 000-0000',
            'phone_uk' => '+44 20 0000 0000',
            'phone_au' => '+61 2 0000 0000',
            'email' => 'hello@yogeshwebdeveloper.com',
            'location' => 'Delhi, India',
            'whatsapp_url' => 'https://wa.me/919876543210',
            'whatsapp_message' => 'Hi Yogesh, I found your website and would like to discuss a web development project.',
            'chat_welcome' => "Hi! I'm Yogesh's assistant 👋 Ask about services, pricing, or hiring — or chat on WhatsApp for a quick reply!",
            'upwork_url' => 'https://www.upwork.com/freelancers/~01bba1b5cc95c508c4',
            'linkedin_url' => '#',
            'twitter_url' => '#',
            'instagram_url' => '#',
            'availability_bullets' => 'Quick Response,Free Consultation,Flexible Hiring',
            'contact_intro' => "I'm available for freelance projects worldwide — USA, Canada, UK, Europe, Australia & India. Remote-friendly with flexible time zones. Fill the form or WhatsApp me — I reply within 24 hours.",
            'contact_success_message' => "Thank you! Your message has been sent. I'll get back to you within 24 hours.",
            'contact_form_title' => 'Send Me a Message',
            'contact_heading' => 'Get In Touch',
            'contact_availability_bullets' => 'Free Consultation,Quick Response,Flexible Hiring Models',
            'seo_locations_heading' => 'Best Freelance Developer Near You',
            'privacy_url' => '#',
            'terms_url' => '#',
            'contact_email_to' => 'hello@yogeshwebdeveloper.com',
            'frontend_url' => 'http://localhost:5173',
            'redirect_to_frontend' => 1,
        ]);
    }

    private static function seed_nav_items() {
        if (!self::is_empty('yg_nav_item')) return;
        $links = [
            ['Home', '/'], ['About Me', '/about'], ['Services', '/services'],
            ['Work', '/work'], ['Testimonials', '/testimonials'], ['Blog', '/blog'], ['Contact', '/contact'],
        ];
        foreach ($links as $i => $link) {
            self::create_post('yg_nav_item', $link[0], '', ['url' => $link[1], 'sort_order' => $i]);
        }
    }

    private static function seed_footer_items() {
        if (!self::is_empty('yg_footer_item')) return;
        $services = [
            'Custom Website Development', 'WordPress Development', 'Laravel Development',
            'React.js Development', 'E-commerce Development', 'Plugin Development',
            'AI Chatbot Development', 'SEO Optimization',
        ];
        foreach ($services as $i => $label) {
            self::create_post('yg_footer_item', $label, '', ['link_type' => 'service', 'url' => '/services', 'sort_order' => $i]);
        }
        $hire = ['Hire Me in USA', 'Hire Me in Canada', 'Hire Me in Australia', 'Hire Me in UK', 'Hire Me in Europe', 'Hire Me in Delhi'];
        foreach ($hire as $i => $label) {
            self::create_post('yg_footer_item', $label, '', ['link_type' => 'hire', 'url' => '/contact', 'sort_order' => $i]);
        }
        $useful = [
            ['About Me', '/about'], ['My Work', '/work'], ['Blog', '/blog'],
            ['Contact', '/contact'], ['Privacy Policy', '#'], ['Terms & Conditions', '#'],
        ];
        foreach ($useful as $i => $item) {
            self::create_post('yg_footer_item', $item[0], '', ['link_type' => 'useful', 'url' => $item[1], 'sort_order' => $i]);
        }
        $seo = [
            'Best Freelance in Saket', 'Best Freelance in Dwarka', 'Best Freelance in Rohini',
            'Best Freelance in Janakpuri', 'Best Freelance in Pitampura', 'Best Freelance in Laxmi Nagar',
            'Best Freelance in Connaught Place', 'Best Freelance in Karol Bagh', 'Best Freelance in South Delhi',
            'Best Freelance in East Delhi', 'Best Freelance in West Delhi', 'Best Freelance in North Delhi',
            'Best Freelance in Nehru Place', 'Best Freelance in Okhla', 'Best Freelance in Vasant Kunj',
            'Best Freelance in Hauz Khas', 'Best Freelance in Defence Colony', 'Best Freelance in Rajouri Garden',
            'Best Freelance in Mayur Vihar', 'Best Freelance in Indirapuram', 'Best Freelance in Vaishali',
            'Best Freelance in Kaushambi', 'Best Freelance in Noida', 'Best Freelance in Gurgaon',
            'Best Freelance in Faridabad', 'Best Freelance in Ghaziabad', 'Best Freelance in Greater Noida',
            'Best Freelance in Delhi NCR', 'Best Freelance in Noida Sector 62', 'Best Freelance in Noida Sector 18',
        ];
        foreach ($seo as $i => $label) {
            self::create_post('yg_footer_item', $label, '', ['link_type' => 'seo', 'url' => '/contact', 'sort_order' => $i]);
        }
    }

    private static function seed_inquiry_types() {
        if (!self::is_empty('yg_inquiry_type')) return;
        $types = [
            'Website Design & Development', 'WordPress Development', 'Laravel Development',
            'React.js Development', 'SEO Optimization', 'AI Chatbot Development', 'RAG AI Chatbot',
            'E-commerce Development', 'Plugin & API Development', 'PHP Development',
            'Website Maintenance', 'Other',
        ];
        foreach ($types as $i => $type) {
            self::create_post('yg_inquiry_type', $type, '', ['sort_order' => $i]);
        }
    }

    private static function seed_hero() {
        if (!self::is_empty('yg_hero')) return;
        self::create_post('yg_hero', 'Homepage Hero', '', [
            'badge_text' => '14+ Years of Experience',
            'headline' => 'Best Freelance Web Developer',
            'headline_highlight' => 'Near Delhi',
            'subtitle' => 'React, WordPress, Laravel, AI chatbots, payment gateways & SEO — 14+ years building fast websites near Delhi.',
            'cta_primary' => 'Get Free Consultation',
            'cta_secondary' => 'View My Work',
            'years_badge' => '14+ Years Experience',
            'projects_count' => '250+',
            'clients_count' => '150+',
        ]);
    }

    private static function seed_text_items($post_type, $items) {
        if (!self::is_empty($post_type)) return;
        foreach ($items as $i => $text) {
            self::create_post($post_type, $text, '', ['sort_order' => $i]);
        }
    }

    private static function seed_services() {
        if (!self::is_empty('yg_service')) return;
        $services = [
            ['RAG AI Chatbot', 'Smart AI bots with RAG for leads, support & automation.', 'ai'],
            ['AI Chatbot Development', 'Custom chatbots with FastAPI, OpenAI & knowledge base.', 'ai'],
            ['HTML to React', 'Convert static HTML sites into fast React applications.', 'react'],
            ['React to WordPress', 'Headless or hybrid React + WordPress solutions.', 'react'],
            ['WordPress Development', 'Custom themes, CMS sites & WooCommerce stores.', 'wordpress'],
            ['Laravel Development', 'Secure, scalable web apps & REST APIs.', 'laravel'],
            ['OpenCart & E-commerce', 'Online stores with cart, checkout & inventory.', 'ecommerce'],
            ['Shopify & Webflow', 'Store setup, theme edits & Webflow to live site.', 'ecommerce'],
            ['Elementor & WPBakery', 'Page builder sites, fixes & speed optimization.', 'wordpress'],
            ['Custom WordPress Plugins', 'Tailored plugins for unique business needs.', 'plugin'],
            ['Payment Gateway Integration', 'Razorpay, HDFC, bank transfer & card payments.', 'plugin'],
            ['Figma to HTML / WordPress', 'Pixel-perfect design to responsive code.', 'code'],
            ['Figma to E-commerce', 'Design to live WooCommerce or Shopify store.', 'ecommerce'],
            ['Core Web Vitals Pass', 'Speed, LCP, CLS & INP optimization for Google.', 'code'],
            ['Schema & Knowledge Panel', 'Structured data for rich results & brand panel.', 'code'],
            ['Google Image SEO', 'Rank photos in Google Images & visual search.', 'code'],
            ['React.js Development', 'Modern SPAs, dashboards & interactive UIs.', 'react'],
            ['PHP & API Development', 'Backend logic, REST APIs & integrations.', 'php'],
        ];
        foreach ($services as $i => $s) {
            self::create_post('yg_service', $s[0], $s[1], ['icon' => $s[2], 'sort_order' => $i]);
        }
    }

    private static function seed_stats() {
        if (!self::is_empty('yg_stat')) return;
        $stats = [['14+', 'Years Experience'], ['250+', 'Projects Completed'], ['150+', 'Happy Clients'], ['24/7', 'Support Available']];
        foreach ($stats as $i => $s) {
            self::create_post('yg_stat', $s[1], '', ['stat_value' => $s[0], 'stat_label' => $s[1], 'sort_order' => $i]);
        }
    }

    private static function seed_cities() {
        if (!self::is_empty('yg_city')) return;
        $cities = [
            'Delhi NCR', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Greater Noida',
            'Saket', 'Dwarka', 'Rohini', 'Janakpuri', 'Pitampura', 'Laxmi Nagar',
            'Connaught Place', 'Karol Bagh', 'South Delhi', 'East Delhi', 'West Delhi',
            'North Delhi', 'Nehru Place', 'Okhla', 'Vasant Kunj', 'Hauz Khas',
            'Defence Colony', 'Rajouri Garden', 'Mayur Vihar', 'Indirapuram',
            'Vaishali', 'Kaushambi', 'Noida Sector 62', 'Noida Sector 18',
        ];
        foreach ($cities as $i => $city) {
            self::create_post('yg_city', $city, '', ['sort_order' => $i]);
        }
    }

    private static function seed_regions() {
        if (!self::is_empty('yg_region')) return;
        $regions = [
            ['United States', '🇺🇸'], ['Canada', '🇨🇦'], ['Australia', '🇦🇺'], ['Europe', '🇪🇺'],
        ];
        $points = 'Smooth Communication,Quality Work,On-Time Delivery,Long Term Support';
        foreach ($regions as $i => $r) {
            self::create_post('yg_region', $r[0], '', ['flag_emoji' => $r[1], 'points' => $points, 'sort_order' => $i]);
        }
    }

    private static function seed_engagement() {
        if (!self::is_empty('yg_engagement')) return;
        $models = [
            ['Hourly Basis', 'Flexible hourly engagement for small tasks, fixes and quick consultations.', 'clock', 0],
            ['Part Time', 'Dedicated part-time developer for ongoing projects with regular weekly hours.', 'user', 1],
            ['Full Time', 'Full-time dedicated developer embedded in your team for large-scale projects.', 'briefcase', 0],
        ];
        foreach ($models as $i => $m) {
            self::create_post('yg_engagement', $m[0], $m[1], ['icon' => $m[2], 'is_popular' => $m[3], 'sort_order' => $i]);
        }
    }

    private static function seed_about() {
        if (!self::is_empty('yg_about')) return;
        self::create_post('yg_about', 'About Me',
            "I'm Yogesh Gupta — 14+ years building React, WordPress, Laravel & AI solutions for clients worldwide. Clean code, fast delivery, SEO that ranks.",
            ['subtitle' => 'Freelance Web Developer from Delhi, India', 'years_experience' => '14+']
        );
    }

    private static function seed_skills() {
        if (!self::is_empty('yg_skill')) return;
        $skills = [
            ['React.js / Next.js', 95], ['WordPress', 98], ['PHP / Laravel', 92], ['JavaScript', 94],
            ['HTML / CSS / Tailwind', 96], ['WooCommerce', 90], ['REST API / GraphQL', 88], ['SEO Optimization', 91],
        ];
        foreach ($skills as $i => $s) {
            self::create_post('yg_skill', $s[0], '', ['percentage' => $s[1], 'sort_order' => $i]);
        }
    }

    private static function seed_experience() {
        if (!self::is_empty('yg_experience')) return;
        $items = [
            ['2010 - 2015', 'Web Developer', 'Freelance & Agencies', 'Started freelance career building custom websites, WordPress themes and PHP applications for local businesses.'],
            ['2015 - 2019', 'Senior WordPress Developer', 'Multiple International Clients', 'Delivered 100+ WordPress projects including e-commerce stores, membership sites and custom plugin development.'],
            ['2019 - 2023', 'Full Stack Developer', 'Global Remote Projects', 'Expanded into React, Laravel and headless CMS solutions for clients in USA, UK, Canada and Australia.'],
            ['2023 - Present', 'Freelance Web Developer', 'Yogesh Web Developer', 'Specializing in React, WordPress, Laravel, AI chatbots and high-performance business websites.'],
        ];
        foreach ($items as $i => $item) {
            self::create_post('yg_experience', $item[1], $item[3], [
                'year_range' => $item[0], 'company' => $item[2], 'sort_order' => $i,
            ]);
        }
    }

    private static function seed_page_seo() {
        if (!self::is_empty('yg_site_seo')) return;
        $pages = [
            ['/', 'Home', 'Yogesh Gupta | Best Freelance Web Developer Near Delhi', ''],
            ['/about', 'About Me', 'About Me', '14+ years of experience building websites that help businesses grow online.'],
            ['/services', 'Services', 'Services I Offer', 'Comprehensive web development solutions tailored to your business needs.'],
            ['/work', 'Work', 'My Work', 'A showcase of 250+ projects delivered for clients across the globe.'],
            ['/testimonials', 'Testimonials', 'Client Testimonials', 'What my clients say about working with me — 150+ happy clients worldwide.'],
            ['/blog', 'Blog', 'Blog', 'Tips, tutorials and insights on web development, WordPress, React and more.'],
            ['/contact', 'Contact', 'Contact Me', "Have a project in mind? Let's discuss how I can help your business grow."],
        ];
        foreach ($pages as $i => $p) {
            self::create_post('yg_site_seo', $p[1] . ' SEO', '', [
                'route_path' => $p[0],
                'banner_title' => $p[2],
                'banner_subtitle' => $p[3],
                'breadcrumb_label' => $p[1],
                'sort_order' => $i,
            ]);
        }
    }

    private static function seed_projects() {
        if (!self::is_empty('yg_project')) return;
        $projects = [
            ['E-commerce Store', 'Full WooCommerce store with payment gateway, inventory management and SEO optimization.', 'WordPress,WooCommerce,PHP'],
            ['Corporate Business Website', 'Modern React-based corporate website with CMS integration and blazing fast performance.', 'React,Tailwind,REST API'],
            ['Laravel CRM System', 'Custom CRM with lead management, invoicing and client portal for a growing agency.', 'Laravel,MySQL,Vue.js'],
            ['AI Chatbot Platform', 'RAG-powered AI chatbot for customer support with knowledge base integration.', 'React,Node.js,OpenAI'],
            ['WordPress Plugin Suite', 'Custom plugin development for product comparison and advanced filtering.', 'WordPress,PHP,JavaScript'],
            ['Real Estate Portal', 'Property listing platform with advanced search, maps and agent dashboards.', 'Laravel,MySQL,Google Maps'],
        ];
        foreach ($projects as $i => $p) {
            self::create_post('yg_project', $p[0], $p[1], ['tech_stack' => $p[2], 'sort_order' => $i]);
        }
    }

    private static function seed_testimonials() {
        if (!self::is_empty('yg_testimonial')) return;
        $reviews = [
            ['Rajesh Sharma', 'CEO, TechStart India', 'India', 5, 'Yogesh delivered our WordPress website ahead of schedule. Clean code, great communication and excellent SEO results. Highly recommended!'],
            ['Michael Johnson', 'Founder, CloudSync USA', 'USA', 5, 'Working with Yogesh remotely was seamless. He built our React dashboard exactly as envisioned. Professional, reliable and skilled developer.'],
            ['Sarah Mitchell', 'Marketing Director, BrandCo', 'UK', 5, 'Outstanding WordPress developer! Our e-commerce site loads fast and ranks well on Google. Yogesh is our go-to developer.'],
        ];
        foreach ($reviews as $i => $r) {
            self::create_post('yg_testimonial', $r[0], $r[4], [
                'client_role' => $r[1], 'client_country' => $r[2], 'rating' => $r[3], 'sort_order' => $i,
            ]);
        }
    }
}
