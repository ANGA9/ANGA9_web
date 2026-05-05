import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/seller/dashboard",
          "/seller/onboarding",
          "/seller/login",
          "/dashboard",
          "/onboarding",
          "/admin",
          "/account",
          "/cart",
          "/checkout",
          "/api/",
        ],
      },
    ],
    sitemap: "https://anga9.com/sitemap.xml",
    host: "https://anga9.com",
  };
}
