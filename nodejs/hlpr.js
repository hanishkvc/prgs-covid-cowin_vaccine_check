/*
 * A bunch of helper routines
 * HanishKVC, 2021
 * GPL
 */


function str_ofvalues(fieldLens, fieldValues) {
	let curStr = '';
	for(i in fieldLens) {
		let curLength = fieldLens[i];
		let curValueR = fieldValues[i];
		if (curValueR === undefined) curValueR = '';
		let curValue = curValueR.toString();
		if (curValue.length > curLength) {
			curValue = curValue.slice(0, curLength);
		} else if (curValue.length < curLength) {
			delta = curLength - curValue.length;
			for(j=0; j < delta; j++) curValue = curValue + ' ';
		}
		curStr += ` ${curValue}`;
	}
	return curStr;
}


exports.str_ofvalues = str_ofvalues

