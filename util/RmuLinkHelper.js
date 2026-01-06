import logger from './LogUtil';

function normalizeMake(rawMake) {
  const cleaned = rawMake.trim();
  return {
    raw: cleaned,
    mapped: cleaned.toUpperCase() === 'SITEBOSS' ? 'Asentria' : 'Westell'
  };
}

export function buildRmuLinkPayload(reqBody) {

  logger.info('buildRmuLinkPayload: start');
  const { raw, mapped } = normalizeMake(reqBody.requestApplication);

  if (reqBody.rmuLegacy == 'Y') {
    return {
      user_id: reqBody.requesterName,
      site_unid: reqBody.siteUnid,
      make: raw,
      ip_address: reqBody.hostname
    };
  }

  return {
    username: reqBody.requesterName,
    site_unid: reqBody.siteUnid,
    make: mapped,
    uri: reqBody.hostname
  };
}

export function buildRmuUnlinkPayload(reqBody) {
  logger.info('buildRmuUnlinkPayload: start');
  return {
    uri: `https://[${reqBody.hostname}]`,
    site_unid: ''
  };
}

export default {
  buildRmuLinkPayload,
  buildRmuUnlinkPayload
};
