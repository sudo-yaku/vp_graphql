import moment from "moment";
import logger from './LogUtil' 

/**
 * Returns URGENCY_LEVEL matching the provided ruleType, ticketTroubleType and ticket age.
 * Lower PRIORITY_ORDER value = higher priority (evaluated first).
 */
function getWorkUrgencyValue(workUrgency, ruleType, ticketTroubleType, ticketCreatedOn) {
  const ticketAgeInDays = ticketCreatedOn
    ? moment().diff(moment(ticketCreatedOn), 'days')
    : 0;

    logger.info(`#getWorkUrgencyValue - ticketAgeInDays: ${ticketAgeInDays}`);

  if (!Array.isArray(workUrgency)) return null;

  const normalizedTroubleType =
    ticketTroubleType == null || ticketTroubleType === "" ? null : ticketTroubleType;

  // Sort ascending so lower PRIORITY_ORDER (higher priority) is checked first
  const prioritizedRules = workUrgency
    .filter(rule => rule.RULE_TYPE === ruleType)
    .sort((a, b) => (a.PRIORITY_ORDER ?? 0) - (b.PRIORITY_ORDER ?? 0));

  for (const rule of prioritizedRules) {
    const ruleTroubleType = rule.TROUBLE_TYPE == null ? null : rule.TROUBLE_TYPE;

    if (ruleTroubleType === null && normalizedTroubleType === null) {
      return rule.URGENCY_LEVEL;
    }

    if (ruleTroubleType !== null && ruleTroubleType === normalizedTroubleType) {
      const minAge = rule.MIN_AGE_DAYS;
      const maxAge = rule.MAX_AGE_DAYS;

      const meetsMin = (minAge == null) || ticketAgeInDays >= minAge;
      const meetsMax = (maxAge == null) || ticketAgeInDays <= maxAge;

      if (meetsMin && meetsMax) {
        return rule.URGENCY_LEVEL;
      }
    }
  }

  return null;
}

module.exports = {
  getWorkUrgencyValue
};
