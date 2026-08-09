import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, habitProof } = body;

    if (!address || !habitProof) {
      return NextResponse.json({ error: 'Missing address or habit proof' }, { status: 400 });
    }

    // --- AI VALIDATION LOGIC ---
    // In a real production scenario, you would call OpenAI here:
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4-turbo",
    //   messages: [{ role: "user", content: `Evaluate this daily wellness habit proof: ${habitProof}. Does it show genuine effort? Respond with YES or NO.` }]
    // });
    // const aiResponse = completion.choices[0].message.content;
    
    // For this hackathon template, we simulate the AI response based on length
    // (Assuming any proof longer than 10 characters is "valid")
    const isApproved = habitProof.length > 10;

    if (!isApproved) {
      return NextResponse.json({ error: 'AI rejected the habit proof. Please provide more detail.' }, { status: 400 });
    }

    // --- ON-CHAIN PREP (SIGNATURE) ---
    // The backend uses a secure private key to sign the message
    // Note: NEVER expose your private key in the frontend. Store it in .env.local
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!privateKey) {
        return NextResponse.json({ error: 'Oracle private key not configured' }, { status: 500 });
    }

    const wallet = new ethers.Wallet(privateKey);
    const timestamp = Math.floor(Date.now() / 1000);

    // Create the message hash: keccak256(abi.encodePacked(address, timestamp))
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256'],
      [address, timestamp]
    );

    // Sign the hash
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      message: 'Habit validated successfully by AI.'
    });

  } catch (error: any) {
    console.error('Error verifying habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
