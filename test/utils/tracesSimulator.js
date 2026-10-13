// Builders and a client for the TRACES NT simulator's control API, so a test can set up CHED
// fixtures without hand-writing JSON. A JavaScript port of Api.TradeTracesNTStub.TestKit.
//
// Dates may be passed as Date objects or ISO 8601 strings.

/**
 * Fluent construction of a CHED fixture, so it reads as the scenario rather than as a JSON literal.
 * Adds no defaults beyond the CHED type note, without which nothing can be built.
 */
export const Ched = {
  chedA: () => Ched.ofType('A'),
  chedP: () => Ched.ofType('P'),
  chedPP: () => Ched.ofType('PP'),
  chedD: () => Ched.ofType('D'),
  // The type is a note, not a field — the same place TRACES keeps it.
  ofType: (chedType) => new CertificateBuilder({ CHED_TYPE: chedType })
}

/**
 * An INTRA is built exactly like a CHED — the schema is the same. What it needs instead of a CHED
 * type is its certificate model, which becomes the document's name.
 */
export const Intra = {
  /** E.g. `Intra.ofModel('64/432 (2016/2008) F1 Bovine')`. */
  ofModel: (certificateModel) => new CertificateBuilder({}, certificateModel)
}

/** A CHED or INTRA fixture. Created by `Ched` or `Intra`. */
export class CertificateBuilder {
  #notes
  #model

  constructor(notes, name) {
    this.#notes = notes
    this.#model = { exchangedDocument: { name }, specifiedConsignment: {} }
  }

  /** Status by TRACES code (`1`) or alias (`NEW`, `VALIDATED`). */
  withStatus(status) {
    this.#model.status = status
    return this
  }

  /** Makes the SOAP face refuse this CHED with a permission-denied fault. */
  notAccessible() {
    this.#model.accessible = false
    return this
  }

  withNote(subjectCode, value) {
    this.#notes[subjectCode] = value
    return this
  }

  /** The applicant's declaration — purpose, what the goods are certified as. */
  withDeclaration(build) {
    this.#model.exchangedDocument.declaration = buildWith(
      new AuthenticationBuilder(),
      build
    )
    return this
  }

  /** The official inspector's decision. Adding it is what "deciding" a CHED means. */
  withClearance(build) {
    this.#model.exchangedDocument.clearance = buildWith(
      new AuthenticationBuilder(),
      build
    )
    return this
  }

  withSupportingDocument(typeCode, reference, issuingCountry) {
    const document = this.#model.exchangedDocument
    document.referenceDocument = [
      ...(document.referenceDocument ?? []),
      {
        documentTypeCode: typeCode,
        relationshipTypeCode: 'ZZZ',
        identifier: reference,
        issuingCountry
      }
    ]
    return this
  }

  withConsignment(build) {
    this.#model.specifiedConsignment = buildWith(
      new ConsignmentBuilder(this.#model.specifiedConsignment),
      build
    )
    return this
  }

  build() {
    return prune({
      ...this.#model,
      exchangedDocument: {
        ...this.#model.exchangedDocument,
        includedNote: { ...this.#notes }
      }
    })
  }
}

export class AuthenticationBuilder {
  #clauses = {}
  #at

  at(when) {
    this.#at = when
    return this
  }

  withClause(id, content) {
    this.#clauses[id] = content
    return this
  }

  /** The applicant's two standard clauses. */
  declaring(purpose, goodsCertifiedAs) {
    return this.withClause('PURPOSE', purpose).withClause(
      'GOODS_CERTIFIED_AS',
      goodsCertifiedAs
    )
  }

  /** All three checks satisfactory, cleared for free circulation. */
  acceptable() {
    return this.withClause(
      'DECISION_CONCLUSION',
      'ACCEPTABLE_FOR_FREE_CIRCULATION'
    )
      .checked('DOCUMENTARY_CHECK', 'SATISFACTORY')
      .checked('IDENTITY_CHECK', 'SATISFACTORY')
      .checked('PHYSICAL_CHECK', 'SATISFACTORY')
  }

  notAcceptable() {
    return this.withClause('DECISION_CONCLUSION', 'NOT_ACCEPTABLE')
      .checked('DOCUMENTARY_CHECK', 'NOT_SATISFACTORY')
      .checked('IDENTITY_CHECK', 'NOT_SATISFACTORY')
      .checked('PHYSICAL_CHECK', 'NOT_SATISFACTORY')
  }

  /** A check is a pair of clauses: that it happened, and how it went. */
  checked(check, result) {
    return this.withClause(check, 'YES').withClause(`${check}_RESULT`, result)
  }

  build() {
    return { actualDateTime: this.#at, includedClause: { ...this.#clauses } }
  }
}

export class ConsignmentBuilder {
  #commodities = []
  #model

  constructor(model = {}) {
    this.#model = { ...model }
  }

  arrivingAt(borderControlPost, countryOfEntry) {
    this.#model.unloadingBaseportLocation = {
      identifier: borderControlPost,
      countryId: countryOfEntry
    }
    return this
  }

  arrivingOn(when) {
    this.#model.availabilityDueDateTime = when
    return this
  }

  leavingOn(when) {
    this.#model.exportExitDateTime = when
    return this
  }

  exportedFrom(countryCode) {
    this.#model.exportCountry = countryCode
    return this
  }

  importedTo(countryCode) {
    this.#model.importCountry = countryCode
    return this
  }

  withConsignor(build) {
    return this.#party('consignorParty', build)
  }

  withConsignee(build) {
    return this.#party('consigneeParty', build)
  }

  withDeliveryParty(build) {
    return this.#party('deliveryParty', build)
  }

  withDespatchParty(build) {
    return this.#party('despatchParty', build)
  }

  withCustomsTransitAgent(build) {
    return this.#party('customsTransitAgentParty', build)
  }

  travellingBy(modeCode, registration, scheme) {
    this.#model.mainCarriageLogisticsTransportMovement = {
      modeCode,
      identifier: registration,
      schemeId: scheme
    }
    return this
  }

  withCommodity(build) {
    this.#commodities.push(buildWith(new CommodityBuilder(), build))
    return this
  }

  /** Consignment-level totals, written as the sequence-0 line TRACES puts first. */
  totalling(grossWeightKg, packageType, packageCount) {
    return this.#item({
      consignmentTotals: {
        grossWeight: { value: grossWeightKg, unitCode: 'KGM' },
        physicalReferencedLogisticsPackage: {
          typeCode: packageType,
          itemQuantity: packageCount
        }
      }
    })
  }

  carryingCargoType(cargoType) {
    return this.#item({ natureIdCargo: cargoType })
  }

  // Commodities given here replace any already on the consignment, as they do on the C# side.
  build() {
    if (this.#commodities.length > 0) {
      this.#item({ includedTradeLineItem: [...this.#commodities] })
    }
    return { ...this.#model }
  }

  #party(key, build) {
    this.#model[key] = buildWith(new PartyBuilder(), build)
    return this
  }

  #item(change) {
    this.#model.includedConsignmentItem = {
      ...this.#model.includedConsignmentItem,
      ...change
    }
    return this
  }
}

export class PartyBuilder {
  #model = {}

  /** A registered operator: the simulator resolves the name, as TRACES does. */
  operator(identifier, scheme) {
    this.#model.identifier = identifier
    this.#model.schemeId = scheme
    return this
  }

  /** An operator created on the fly — a name and no identifier, so no lookup happens. */
  named(name) {
    this.#model.name = name
    return this
  }

  inCountry(countryCode) {
    return this.#address({ countryId: countryCode })
  }

  at(lineOne, city, postcode) {
    return this.#address({ lineOne, cityName: city, postcodeCode: postcode })
  }

  build() {
    return { ...this.#model }
  }

  #address(change) {
    this.#model.postalAddress = { ...this.#model.postalAddress, ...change }
    return this
  }
}

export class CommodityBuilder {
  #classifications = {}
  #notes = {}
  #model = {}

  /** Combined Nomenclature code. The simulator expands it to its description hierarchy. */
  cnCode(cnCode) {
    return this.classifiedAs('CN', cnCode)
  }

  classifiedAs(system, code) {
    this.#classifications[system] = code
    return this
  }

  originCountry(countryCode) {
    this.#model.originCountry = countryCode
    return this
  }

  scientificName(name) {
    this.#model.scientificName = name
    return this
  }

  netWeightKg(kilograms) {
    return this.netWeight(kilograms, 'KGM')
  }

  /** Net weight in any UNECE mass unit — `GRM`, `KGM` or `TNE`. */
  netWeight(value, unitCode) {
    this.#model.netWeight = { value, unitCode }
    return this
  }

  /**
   * A count of animals. TRACES carries it as a net volume in pieces (`H87`), which is what a
   * CHED-A's customs quantity is measured in.
   */
  pieces(count) {
    this.#model.netVolume = { value: count, unitCode: 'H87' }
    return this
  }

  packages(count, packageType) {
    this.#model.physicalReferencedLogisticsPackage = {
      typeCode: packageType,
      itemQuantity: count
    }
    return this
  }

  withNote(subjectCode, value) {
    this.#notes[subjectCode] = value
    return this
  }

  build() {
    return {
      ...this.#model,
      applicableClassification: { ...this.#classifications },
      additionalInformationNote: { ...this.#notes }
    }
  }
}

/**
 * Drives the simulator's control API from a test. Thin on purpose: it saves repeating the URL, the
 * JSON handling and the status check, and throws with the simulator's own message.
 *
 * Every method takes an optional `{ signal }` to cancel the request.
 */
export class SimulatorControlClient {
  #baseUrl

  /** Points at a simulator by base address, e.g. `http://localhost:8085`. */
  static at(baseUrl) {
    return new SimulatorControlClient(baseUrl)
  }

  constructor(baseUrl) {
    this.#baseUrl = baseUrl.replace(/\/$/, '')
  }

  /** Creates a CHED and returns the ID it was stored under. Takes a builder or a built model. */
  createChed(ched, options) {
    return this.#create('/control/cheds', ched, 'a CHED', options)
  }

  updateChed(id, ched, options) {
    return this.#send(
      'PUT',
      `/control/cheds/${id}`,
      ched,
      `update CHED '${id}'`,
      options
    )
  }

  /**
   * Merges a partial CHED into a stored one. This is how a decision is applied: build a CHED
   * carrying only the clearance block and the new status, and send that.
   */
  patchChed(id, patch, options) {
    return this.#send(
      'PATCH',
      `/control/cheds/${id}`,
      patch,
      `patch CHED '${id}'`,
      options
    )
  }

  deleteChed(id, options) {
    return this.#send(
      'DELETE',
      `/control/cheds/${id}`,
      null,
      `delete CHED '${id}'`,
      options
    )
  }

  /** Creates an INTRA and returns the ID it was stored under. Takes a builder or a built model. */
  createIntra(intra, options) {
    return this.#create('/control/intras', intra, 'an INTRA', options)
  }

  updateIntra(id, intra, options) {
    return this.#send(
      'PUT',
      `/control/intras/${id}`,
      intra,
      `update INTRA '${id}'`,
      options
    )
  }

  patchIntra(id, patch, options) {
    return this.#send(
      'PATCH',
      `/control/intras/${id}`,
      patch,
      `patch INTRA '${id}'`,
      options
    )
  }

  deleteIntra(id, options) {
    return this.#send(
      'DELETE',
      `/control/intras/${id}`,
      null,
      `delete INTRA '${id}'`,
      options
    )
  }

  /** Empties the simulator of CHEDs and INTRAs alike. Call it before a test, not after. */
  reset(options) {
    return this.#send(
      'POST',
      '/control/reset',
      null,
      'reset the simulator',
      options
    )
  }

  async #create(path, certificate, what, options) {
    const response = await this.#send(
      'POST',
      path,
      certificate,
      `create ${what}`,
      options
    )
    const created = await response.json()
    return created.id
  }

  async #send(method, path, body, what, { signal } = {}) {
    const response = await fetch(this.#baseUrl + path, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body
        ? JSON.stringify(
            body instanceof CertificateBuilder ? body.build() : body
          )
        : undefined
    })

    if (!response.ok) {
      // Carry the simulator's message through — it names the code or file that needs fixing.
      const text = await response.text()
      throw new Error(
        `The simulator refused to ${what} (${response.status}): ${text}`
      )
    }

    return response
  }
}

function buildWith(builder, build) {
  build(builder)
  return builder.build()
}

// Drops unset fields and empty objects, so a patch leaves them alone.
function prune(value) {
  if (Array.isArray(value)) return value.map(prune)
  if (value === null || typeof value !== 'object' || value instanceof Date)
    return value
  const kept = Object.entries(value)
    .map(([k, v]) => [k, prune(v)])
    .filter(([, v]) => v !== undefined && v !== null)
  return kept.length > 0 ? Object.fromEntries(kept) : undefined
}
