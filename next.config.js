// next.config.js
module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "k2btciufj0chkpse.public.blob.vercel-storage.com",
            },
            {
                protocol: "https",
                hostname: "cbrossar-website.s3.amazonaws.com",
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: [
            "puppeteer-core",
            "@sparticuz/chromium",
        ],
        outputFileTracingIncludes: {
            '/api/ltrain': ['./app/api/ltrain/**/*'],
          },
    },
};
