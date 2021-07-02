console.log("chat");
const socket = new WebSocket(window.location.origin.replace("http", "ws"));

socket.onopen = function (e) {
	socket.send(
		JSON.stringify({
			type: "CHAT_CONNECT",
		}),
	);

	const chatWr = document.querySelector("[data-chatwr]");
	const userConnected = document.querySelector("[data-users]");

	socket.onmessage = function (event) {
		const parsedMessage = JSON.parse(event.data);

		switch (parsedMessage.type) {
			case "CHAT_CONNECT":
				console.log("CHAT_CONNECT");
				console.log(parsedMessage.payload);
				userConnected.insertAdjacentHTML("afterend", `<div>${parsedMessage.payload}</div>`);

				break;
			case "CHAT_MESSAGE":
				console.log("CHAT_MESSAGE");
				console.log(parsedMessage.payload);
				chatWr.insertAdjacentHTML(
					"beforeend",
					`
					<li><strong>${parsedMessage.payload.isIam ? "Я" : parsedMessage.payload.name}</strong>: ${
						parsedMessage.payload.message
					}</li>`,
				);
				break;
			default:
				break;
		}
	};

	socket.onclose = function (event) {};

	const sendMessageForm = document.forms.message;

	sendMessageForm?.addEventListener("submit", (e) => {
		e.preventDefault(e);
		const message = sendMessageForm.message.value;

		if (message) {
			socket.send(
				JSON.stringify({
					type: "CHAT_MESSAGE",
					payload: message,
				}),
			);

			sendMessageForm.reset();
		}
	});
};

socket.onerror = function (error) {
	alert(`[error] ${error.message}`);
};
//339610340
