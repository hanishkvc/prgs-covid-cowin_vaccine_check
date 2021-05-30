/*
 * A bunch of helper routines
 * HanishKVC, 2021
 * GPL
 */


/*
 * Put the passed fieldValues into a tabular form in a string
 * by either adding spaces or truncating the field values as
 * required to match the column/field length.
 * If passed array of fieldLens is shorter than the array of
 * values, then existing field lengths are duplicated to fill
 * the missing field lengths.
 */
function str_tabular(fieldLens, fieldValues) {
	let curStr = '';
	if (fieldLens.length < fieldValues.length) {
		let j = 0;
		let len = fieldLens.length;
		for(let i = len; i < fieldValues.length; i++) {
			fieldLens.push(fieldLens[j])
			j += 1;
			j %= len;
		}
	}
	for(i in fieldValues) {
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


/*
 * Check if given string in the array.
 */
function strlist_findindex(strList, findStr) {
	return strList.findIndex((curStr) => {
		if (findStr.toUpperCase() === curStr.toUpperCase()) return true;
		return false;
		});
}


if (typeof(exports) === 'undefined') exports = {};
exports.str_tabular = str_tabular
exports.strlist_findindex = strlist_findindex

