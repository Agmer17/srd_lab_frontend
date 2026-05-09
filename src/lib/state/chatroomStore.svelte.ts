class SelectedChatroom {
    current = $state<string | null>(null);

    select(chatroomId: string) {
        this.current = chatroomId;
    }

    clear() {
        this.current = null;
    }
}

export const selectedChatroomState = new SelectedChatroom();