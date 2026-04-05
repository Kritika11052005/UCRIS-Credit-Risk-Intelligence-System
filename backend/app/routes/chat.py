from fastapi import APIRouter, HTTPException, Depends, Request
from app.database import db
from app.routes.predictions import get_current_user
from app.services.chat import chat_with_context
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None
    conversation_id: Optional[str] = None

@router.get("/conversations")
async def get_conversations(current_user=Depends(get_current_user)):
    """List all previous conversations for the authenticated user."""
    return await db.conversation.find_many(
        where={"user_id": current_user.id},
        order={"updated_at": "desc"}
    )

@router.get("/conversations/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    current_user=Depends(get_current_user)
):
    """Retrieve all messages for a specific conversation thread."""
    conv = await db.conversation.find_unique(
        where={"id": conversation_id},
        include={"messages": True}
    )
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Sort messages by creation time
    messages = sorted(conv.messages, key=lambda m: m.created_at)
    return messages

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user)
):
    """Delete a conversation thread and all its messages."""
    conv = await db.conversation.find_unique(
        where={"id": conversation_id}
    )
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Cascade delete messages first
    await db.message.delete_many(where={"conversation_id": conversation_id})
    await db.conversation.delete(where={"id": conversation_id})
    
    return {"status": "success", "message": "Conversation deleted"}

@router.post("")
async def chat_interaction(
    body: ChatRequest,
    current_user=Depends(get_current_user)
):
    """Handle a chat interaction, saving both the user prompt and AI response."""
    
    # 1. Resolve or create conversation
    conv_id = body.conversation_id
    if not conv_id:
        # Create a new conversation if none provided
        title = body.message[:50] + ("..." if len(body.message) > 50 else "")
        conv = await db.conversation.create(
            data={
                "user_id": current_user.id,
                "title": title,
                "last_message": body.message
            }
        )
        conv_id = conv.id
    else:
        # Verify ownership
        conv = await db.conversation.find_unique(where={"id": conv_id})
        if not conv or conv.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # 2. Save user message
    await db.message.create(
        data={
            "conversation_id": conv_id,
            "role": "user",
            "content": body.message
        }
    )

    # 3. Get AI response (RAG grounded in customer data)
    result = await chat_with_context(
        message=body.message,
        customer_id=body.customer_id
    )
    answer = result["answer"]

    # 4. Save AI message
    await db.message.create(
        data={
            "conversation_id": conv_id,
            "role": "assistant",
            "content": answer
        }
    )

    # 5. Update conversation timestamp and last message
    await db.conversation.update(
        where={"id": conv_id},
        data={
            "last_message": answer[:100] + ("..." if len(answer) > 100 else ""),
        }
    )

    return {
        "conversation_id": conv_id,
        "answer": answer,
        "sources": result.get("sources", [])
    }
