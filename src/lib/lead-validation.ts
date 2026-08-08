/**
 * lead-validation
 * The rules that decide whether a set of contact details is worth putting in
 * front of the concierge. Shared deliberately: the atelier prompt runs them so
 * the visitor gets an instant, specific complaint, and the API routes run the
 * same functions so a scripted POST cannot walk past them. One definition, two
 * enforcement points — a client-only check is decoration.
 *
 * The bar is "could a human being plausibly own this", not "does this exist".
 * We cannot dial the number or send the mail from here, so the job is to catch
 * the things nobody owns: keyboard mash, placeholders, counting sequences,
 * burner mailboxes. Every rule below errs toward letting an odd-looking real
 * person through, because the cost of turning away a genuine commission is far
 * higher than the cost of one junk row in the inbox.
 */

export type LeadErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

/* ------------------------------------------------------------- shared bits */

/**
 * Words nobody is actually called and no one's real mailbox is named. Matched
 * whole-token, never as a substring — "Nat" must not trip "na", and a surname
 * like "Foong" must not trip "foo".
 */
const PLACEHOLDER_TOKENS = new Set([
  "test", "testing", "tester", "asdf", "asdfg", "asdfgh", "asd", "qwe", "qwerty",
  "abc", "abcd", "abcde", "xyz", "aaa", "xxx", "xxxx", "zzz", "none", "null",
  "nil", "na", "nan", "fake", "dummy", "sample", "example", "user", "username",
  "admin", "anonymous", "anon", "unknown", "noname", "nobody", "blah", "foo",
  "bar", "baz", "lorem", "ipsum", "idk", "whatever", "dontknow", "mickeymouse",
  "johndoe", "janedoe", "firstname", "lastname", "fullname", "yourname",
]);

/** Keyboard rows, for spotting a hand dragged across them. */
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "azertyuiop", "qwertzuiop"];

/**
 * Four or more keys running along a keyboard row, either direction — "asdf",
 * "poiu", "vbnm". Four is the shortest length that no real name contains; at
 * three, "wer" would condemn anyone called Werner.
 */
function hasKeyboardRun(value: string, len = 4): boolean {
  const low = value.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const reversed = [...row].reverse().join("");
    for (const line of [row, reversed]) {
      for (let i = 0; i + len <= line.length; i++) {
        if (low.includes(line.slice(i, i + len))) return true;
      }
    }
  }
  return false;
}

/** The same character `run` times over: "aaaa", "!!!!". */
function hasRepeatRun(value: string, run: number): boolean {
  return new RegExp(`(.)\\1{${run - 1}}`).test(value);
}

/* -------------------------------------------------------------------- name */

/**
 * Letters (any script), marks, spaces, and the punctuation that genuinely
 * appears in names: apostrophes, hyphens, full stops, and the solidus in the
 * Singaporean and Malaysian patronymics "Krishnan s/o Muthu" and "Nurul d/o
 * Ahmad" — refusing those would turn away a large part of the home market.
 * Must open with a letter. Digits and "@" are what this is here to refuse.
 */
const NAME_SHAPE = /^[\p{L}\p{M}][\p{L}\p{M}\s'’\-./]*$/u;

/** A web address wearing a name's clothes — the slash above lets these through. */
const LOOKS_LIKE_URL = /:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|sg|uk|me|xyz)\b/i;

/** A token written in the Latin alphabet, so the vowel rule may judge it. */
const LATIN_TOKEN = /^[a-z'’.\-]+$/i;

export function validateName(raw: string): string | undefined {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return "Please tell us your name.";
  if (name.length > 80) return "That name is too long.";

  const letters = (name.match(/[\p{L}]/gu) ?? []).length;
  if (letters < 2) return "Please enter your full name.";
  if (!NAME_SHAPE.test(name) || LOOKS_LIKE_URL.test(name)) {
    return "Names use letters only — no numbers, links or symbols.";
  }
  if (hasRepeatRun(name, 4) || hasKeyboardRun(name)) return "Please enter your real name.";

  const tokens = name.toLowerCase().split(/[\s'’\-./]+/).filter(Boolean);
  /* Both the parts and the whole: "doe" alone is a conceivable surname, but
     "John Doe" is the placeholder everyone reaches for. */
  if (tokens.some((t) => PLACEHOLDER_TOKENS.has(t)) || PLACEHOLDER_TOKENS.has(tokens.join(""))) {
    return "Please enter your real name.";
  }

  /* A run of Latin letters with no vowel in it is a mash, not a name. Applied
     only to Latin tokens: a name written in Chinese, Tamil or Arabic has no
     vowel letters to find, and this rule would condemn every one of them.
     "y" counts, so Lynn and Nyx survive; the 4-character floor keeps the very
     common Singaporean surnames Ng and Ang clear of it. */
  if (tokens.some((t) => t.length >= 4 && LATIN_TOKEN.test(t) && !/[aeiouy]/i.test(t))) {
    return "Please enter your real name.";
  }
  return undefined;
}

/* ------------------------------------------------------------------- email */

const EMAIL_SHAPE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/;

/**
 * Burner-mailbox providers. A commission runs four to six weeks and the quote
 * lands by mail, so an address that expires in ten minutes is not a lead — it
 * is a way of not being contacted.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "10minutemail.com",
  "tempmail.com", "temp-mail.org", "yopmail.com", "throwawaymail.com",
  "trashmail.com", "sharklasers.com", "dispostable.com", "getnada.com",
  "fakeinbox.com", "maildrop.cc", "mintemail.com", "spamgourmet.com",
  "mailnesia.com", "discard.email", "moakt.com", "emailondeck.com", "tempr.email",
  "mohmal.com", "inboxbear.com", "grr.la", "spam4.me", "byom.de", "mytrashmail.com",
  "tempmailo.com", "emailfake.com", "burnermail.io", "mailcatch.com", "trbvm.com",
]);

/** Near-misses on the big providers — worth a nudge rather than a flat refusal. */
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com", "gmail.con": "gmail.com", "gmail.om": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com", "hotmall.com": "hotmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yhaoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com", "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com",
  "hotmaill.com": "hotmail.com", "iclod.com": "icloud.com", "icloud.co": "icloud.com",
};

export function validateEmail(raw: string): string | undefined {
  const email = raw.trim().toLowerCase();
  if (!email) return "Please give us an email address.";
  if (email.length > 160) return "That email address is too long.";
  if (!EMAIL_SHAPE.test(email)) return "That email address doesn’t look right.";

  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (email.includes("..") || local.startsWith(".") || local.endsWith(".")) {
    return "That email address doesn’t look right.";
  }

  const suggestion = DOMAIN_TYPOS[domain];
  if (suggestion) return `Did you mean @${suggestion}?`;
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return "Please use a permanent email address — your quote and certificate are sent there.";
  }

  /* test@…, asdf@…, and test@test.com: junk in the mailbox name, or a domain
     whose own label is a placeholder. */
  const localTokens = local.split(/[._%+-]+/).filter(Boolean);
  const domainLabel = domain.split(".")[0]!;
  if (
    localTokens.every((t) => PLACEHOLDER_TOKENS.has(t)) ||
    PLACEHOLDER_TOKENS.has(domainLabel) ||
    hasKeyboardRun(local) ||
    hasRepeatRun(local, 5)
  ) {
    return "Please enter your real email address.";
  }
  return undefined;
}

/* ------------------------------------------------------------------- phone */

/** Numbers that are typed to fill a box, not to be answered. */
const FAKE_NUMBERS = new Set([
  "1234567890", "0123456789", "12345678", "123456789", "1234567",
  "0000000000", "1111111111", "9999999999", "5555555555", "1234512345",
  "1212121212", "9876543210", "987654321", "87654321",
]);

/** Every step +1, or every step −1: 12345678, 98765432. */
function isCountingRun(digits: string): boolean {
  if (digits.length < 5) return false;
  let ascending = true;
  let descending = true;
  for (let i = 1; i < digits.length; i++) {
    const delta = digits.charCodeAt(i) - digits.charCodeAt(i - 1);
    if (delta !== 1) ascending = false;
    if (delta !== -1) descending = false;
  }
  return ascending || descending;
}

export function validatePhone(raw: string): string | undefined {
  const phone = raw.trim();
  if (!phone) return "Please give us a number we can reach you on.";
  if (phone.length > 40) return "That number is too long.";
  if (/[^\d\s+()\-.]/.test(phone)) return "Phone numbers use digits only.";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "That number is too short — include the area or country code.";
  if (digits.length > 15) return "That number is too long.";

  if (new Set(digits).size === 1 || isCountingRun(digits) || FAKE_NUMBERS.has(digits)) {
    return "Please enter a real contact number.";
  }

  /* Singapore is the house's home market and the field is prefilled to it, so a
     bare 8-digit number (or one behind +65) is read as local and must open on a
     line Singapore actually issues: 8 and 9 mobile, 6 landline, 3 VoIP.
     International numbers carry their own country code and are left alone —
     we are in no position to police the numbering plan of every country. */
  const sgLocal =
    digits.length === 8 ? digits : digits.length === 10 && digits.startsWith("65") ? digits.slice(2) : null;
  if (sgLocal && !/^[3689]/.test(sgLocal)) {
    return "Singapore numbers begin with 8, 9, 6 or 3 — or add your country code.";
  }
  return undefined;
}

/* ------------------------------------------------------------------ bundle */

/** Every field at once. `ok` is true only when nothing came back. */
export function validateLead(input: { name: string; phone: string; email: string }): {
  ok: boolean;
  errors: LeadErrors;
} {
  const errors: LeadErrors = {
    name: validateName(input.name),
    phone: validatePhone(input.phone),
    email: validateEmail(input.email),
  };
  const ok = !errors.name && !errors.phone && !errors.email;
  return { ok, errors };
}
