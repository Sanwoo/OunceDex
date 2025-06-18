import { NextResponse } from 'next/server'

interface CurrencyApiResponse {
  meta: {
    last_updated_at: string
  }
  data: {
    [key: string]: {
      code: string
      value: number
    }
  }
}

interface ApiErrorResponse {
  error: string
}

const API_KEY = process.env.CURRENCY_API_KEY

export async function GET() {
  try {
    const res = await fetch(`https://api.currencyapi.com/v3/latest?apikey=${API_KEY}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch currency rates')
    }

    const data = (await res.json()) as CurrencyApiResponse
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching currency rates:', error)
    const errorResponse: ApiErrorResponse = { error: 'Failed to fetch currency rates' }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
