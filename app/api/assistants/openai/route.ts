import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ServerRuntime } from "next"
import { OpenAI } from "openai"

export const runtime: ServerRuntime = "edge"

import { SocksProxyAgent } from "socks-proxy-agent"
const proxyUrl = process.env.OPENAI_API_PROXY || "" // Replace with your SOCKS5 proxy's address and port
const agent = new SocksProxyAgent(proxyUrl)

export async function GET() {
  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      httpAgent: agent,
      organization: profile.openai_organization_id
    })

    const myAssistants = await openai.beta.assistants.list({
      limit: 100
    })

    return new Response(JSON.stringify({ assistants: myAssistants.data }), {
      status: 200
    })
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
