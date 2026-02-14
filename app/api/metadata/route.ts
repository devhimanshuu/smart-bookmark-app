import { NextRequest, NextResponse } from "next/server";
import { parse } from "node-html-parser";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const url = searchParams.get("url");

	if (!url) {
		return NextResponse.json({ error: "URL is required" }, { status: 400 });
	}

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
			next: { revalidate: 3600 }, // Cache for 1 hour
		});

		if (!response.ok) {
			throw new Error("Failed to fetch website content");
		}

		const html = await response.text();
		const root = parse(html);

		// Extract OG and Standard Metadata
		const title =
			root
				.querySelector('meta[property="og:title"]')
				?.getAttribute("content") ||
			root.querySelector("title")?.text ||
			"";

		const description =
			root
				.querySelector('meta[property="og:description"]')
				?.getAttribute("content") ||
			root.querySelector('meta[name="description"]')?.getAttribute("content") ||
			"";

		const image =
			root
				.querySelector('meta[property="og:image"]')
				?.getAttribute("content") ||
			root
				.querySelector('meta[name="twitter:image"]')
				?.getAttribute("content") ||
			"";

		return NextResponse.json({
			title: title.trim(),
			description: description.trim(),
			image: image.startsWith("http")
				? image
				: image
					? new URL(image, url).href
					: "",
		});
	} catch (error: any) {
		console.error("Metadata fetch error:", error.message);
		return NextResponse.json(
			{ error: "Failed to fetch metadata" },
			{ status: 500 },
		);
	}
}
