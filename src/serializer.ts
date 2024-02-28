class RESPSerializer {
	readonly CRLF = "\r\n";

	serialize(input: unknown, errorPrefix?: string): string | Error {
		if (errorPrefix) {
			return "-" + errorPrefix.toLocaleUpperCase() + this.CRLF + input + this.CRLF;
		}

		if (typeof input == "string") {
			return this.serializeString(input);
		}

		if (typeof input == "number") {
			return this.serializeNumber(input);
		}

		if (typeof input == null) {
			return this.serializeNull();
		}

		if (typeof input == "boolean") {
			return this.serializeBoolean(input);
		}

		if (input instanceof Array) {
			return this.serializeArray(input);
		}

		if (input instanceof Set) {
			return this.serializeSet(input);
		}

		if (input instanceof Map) {
			return this.serializeMap(input);
		}

		throw new Error("Invalid input type");
	}

	serializeString(input: string): string {
		const inputsArr = input.split(this.CRLF);
		let serializedInput = "";

		if (inputsArr.length == 1) {
			serializedInput = "+" + input + this.CRLF;
		} else {
			inputsArr.forEach((element) => {
				serializedInput += "$" + element.length + this.CRLF + element + this.CRLF;
			});
		}

		return serializedInput;
	}

	serializeNumber(input: number): string {
		let upperLimit = 2 ** 63 - 1;

		if (Number.isInteger(input) && Math.abs(input) > upperLimit) {
			return "(" + input.toString() + this.CRLF;
		} else if (Number.isInteger(input)) {
			return ":" + input.toString() + this.CRLF;
		} else {
			return "," + input.toString() + this.CRLF;
		}
	}

	serializeNull(): string {
		return "$-1\r\n";
	}

	serializeBoolean(input: boolean): string {
		return input == true ? "#t\r\n" : "#f\r\n";
	}

	serializeArray(input: any[]) {
		let serializedInput = `*${input.length}${this.CRLF}`;

		input.forEach((element) => {
			serializedInput += this.serialize(element);
		});

		return serializedInput;
	}

	serializeSet(input: Set<unknown>) {
		let serializedInput = `~${input.size}${this.CRLF}`;

		input.forEach((element) => {
			serializedInput += this.serialize(element);
		});

		return serializedInput;
	}

	serializeMap(input: Map<unknown, unknown>) {
		let serializedInput = `%${input.size}${this.CRLF}`;

		input.forEach((key, value) => {
			let keyS = this.serialize(key);
			let valueS = this.serialize(value);

			if (typeof keyS == "string" && typeof valueS == "string") {
				serializedInput += keyS + valueS;
			}
		});

		return serializedInput;
	}
}
