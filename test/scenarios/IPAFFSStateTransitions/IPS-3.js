describe('BTMS receives an update to an existing IPAFFS Notification - New → In Progress → Rejected - IPS-3', function () {
  const testDataArray = [
    {
      testName: 'CHEDA with H221 check - Rejected',
      chedType: 'CHEDA',
      TaricCommodityCode: '0103911000',
      Doccode: 'C640',
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
      submittedDecisions: { checkCode: 'H221', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H221', decision: 'H02' },
      finalDecisions: { checkCode: 'H221', decision: 'N02' },
      finalIpaffsPayload: {
        version: 3,
        status: 'REJECTED',
        decisionBy: {
          displayName: 'Gary Admin-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: false,
            notAcceptableAction: 'slaughter',
            notAcceptableReasons: ['AbsenceAdditionalGuarantees'],
            decision: 'Non Acceptable',
            ifChanneledOption: 'article15'
          },
          consignmentCheck: {
            euStandard: 'Satisfactory',
            documentCheckResult: 'Not Satisfactory',
            nationalRequirements: 'Satisfactory',
            additionalGuarantees: 'Not Set',
            identityCheckResult: 'Satisfactory',
            physicalCheckResult: 'Derogation',
            welfareCheck: 'Satisfactory',
            numberOfAnimalsChecked: 1
          },
          impactOfTransportOnAnimals: {
            numberOfDeadAnimals: 0,
            numberOfDeadAnimalsUnit: 'number',
            numberOfUnfitAnimals: 0,
            numberOfUnfitAnimalsUnit: 'number',
            numberOfBirthOrAbortion: 0
          },
          laboratoryTestsRequired: false,
          resealedContainersIncluded: false,
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Gary',
              lastName: 'Admin-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-04-03T19:05:10.856196325'
            }
          },
          bipLocalReferenceNumber: '12312',
          controlledDestination: {
            id: '7e07c8e4-8791-4f88-ab8d-f0815a4bf6a2',
            type: 'destination',
            status: 'approved',
            companyName: 'C C SERVICE',
            approvalNumber: '82/517/8001/ABP/MED',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: 'n/a',
              city: 'TWYNHOLM',
              postalZipCode: 'DG6 4NN',
              countryISOCode: 'GB'
            }
          },
          checkDate: '2020-04-23T09:01:00Z',
          accompanyingDocuments: [
            {
              documentType: 'veterinaryHealthCertificate',
              documentReference: '123123',
              documentIssueDate: '2017-01-01',
              attachmentId: 'dafa119f-75af-495e-a7b6-6248da253e8d',
              attachmentFilename: 'eicar.com.pdf',
              attachmentContentType: 'application/pdf'
            }
          ]
        },
        partThree: {
          controlStatus: 'REQUIRED'
        }
      }
    },
    {
      testName: 'CHEDD with H222 check - Rejected',
      chedType: 'CHEDD',
      TaricCommodityCode: '0908110000',
      Doccode: 'C678',
      Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
      submittedDecisions: { checkCode: 'H223', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H223', decision: 'H02' },
      finalDecisions: { checkCode: 'H223', decision: 'N07' },
      finalIpaffsPayload: {
        version: 3,
        status: 'REJECTED',
        decisionBy: {
          displayName: 'Gary Admin-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: false,
            notAcceptableAction: 'other',
            notAcceptableActionByDate: '2025-08-08',
            notAcceptableReasons: ['Other'],
            notAcceptableOtherReason: 'Test',
            decision: 'Non Acceptable'
          },
          consignmentCheck: {
            documentCheckResult: 'Not Satisfactory',
            identityCheckDone: true,
            identityCheckResult: 'Not Satisfactory',
            physicalCheckDone: true,
            physicalCheckResult: 'Satisfactory'
          },
          laboratoryTestsRequired: false,
          resealedContainersIncluded: false,
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Gary',
              lastName: 'Admin-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-08-08T18:17:27.268026921'
            }
          },
          bipLocalReferenceNumber: '123456',
          controlledDestination: {
            id: '24e5c166-313d-4341-b431-ea5308c6c10a',
            type: 'destination',
            status: 'nonapproved',
            companyName: 'Horses are us',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: '1 New Building',
              addressLine2: 'Main Street',
              addressLine3: 'Eastend',
              city: 'London',
              postalZipCode: 'W1 1WA',
              countryISOCode: 'GB',
              ukTelephone: '02090999999',
              telephone: '02090999999',
              email: 'horsesrus@mailinator.net'
            },
            tracesId: 10057861
          },
          checkDate: '2025-08-08T19:30:00Z',
          inspectionRequired: 'Inconclusive'
        },
        partThree: {
          controlStatus: 'REQUIRED',
          sealCheckRequired: false
        }
      }
    },
    {
      testName: 'CHEDP with H223 check - Rejected',
      chedType: 'CHEDP',
      TaricCommodityCode: '0709601000',
      Doccode: 'N853',
      Checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
      submittedDecisions: { checkCode: 'H222', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H222', decision: 'H02' },
      finalDecisions: { checkCode: 'H222', decision: 'N02' },
      finalIpaffsPayload: {
        version: 3,
        status: 'REJECTED',
        decisionBy: {
          displayName: 'Mark Admin-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: '2024-06-27T11:00:48.529939947Z',
        partTwo: {
          decision: {
            consignmentAcceptable: false,
            notAcceptableAction: 'destruction',
            notAcceptableDestructionReason: 'not accept test',
            notAcceptableActionByDate: '2024-06-27',
            notAcceptableReasons: ['AbsenceInvalidCertificate'],
            decision: 'Non Acceptable'
          },
          consignmentCheck: {
            documentCheckResult: 'Not Satisfactory',
            identityCheckType: 'Not Done',
            identityCheckResult: 'Not Done',
            identityCheckNotDoneReason: 'Not required',
            physicalCheckResult: 'Not Done',
            physicalCheckNotDoneReason: 'Reduced checks regime'
          },
          laboratoryTestsRequired: false,
          resealedContainersIncluded: false,
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Mark',
              lastName: 'Admin-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2024-06-27T11:00:48.555950265'
            }
          },
          controlledDestination: {
            id: 'e9ea6a6e-3c72-42d2-a5ee-6e41159dfada',
            type: 'destination',
            status: 'nonapproved',
            companyName: 'Horses are us',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: '1 New Building',
              addressLine2: 'Main Street',
              addressLine3: 'Eastend',
              city: 'London',
              postalZipCode: 'W1 1WA',
              countryISOCode: 'GB',
              ukTelephone: '02090999999',
              telephone: '02090999999',
              email: 'horsesrus@mailinator.net'
            },
            tracesId: 10060784
          },
          checkDate: '2024-06-27T09:11:00Z',
          inspectionRequired: 'Inconclusive'
        },
        partThree: {
          controlStatus: 'REQUIRED',
          sealCheckRequired: false
        }
      }
    },
    {
      testName: 'CHEDPP with multiple checks - Rejected',
      chedType: 'CHEDPP',
      TaricCommodityCode: '8432100000',
      Doccode: ['N851', 'N002'],
      Checks: [
        { CheckCode: 'H219', DepartmentCode: 'PHSI' },
        { CheckCode: 'H218', DepartmentCode: 'HMI' }
      ],
      submittedDecisions: [
        { checkCode: 'H219', decision: 'H02' },
        { checkCode: 'H218', decision: 'H02' }
      ],
      inprogressDecisions: [
        { checkCode: 'H219', decision: 'H02' },
        { checkCode: 'H218', decision: 'H02' }
      ],
      finalDecisions: [
        { checkCode: 'H219', decision: 'N01' },
        { checkCode: 'H218', decision: 'N01' }
      ],
      finalIpaffsPayload: {
        version: 3,
        status: 'REJECTED',
        decisionBy: {
          displayName: 'Multi Admin-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba63'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          commodityChecks: [
            {
              uniqueComplementId: '7d7bfacd-871e-41c0-906d-4c8722824893',
              checks: [
                {
                  type: 'PHSI_DOCUMENT',
                  status: 'Non compliant'
                },
                {
                  type: 'PHSI_IDENTITY',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_PHYSICAL',
                  status: 'Compliant'
                },
                {
                  type: 'HMI',
                  status: 'Non compliant'
                }
              ]
            }
          ],
          inspectionRequired: 'Required'
        },
        partThree: {}
      }
    }
  ]

  testDataArray.forEach((testData) => {
    it(testData.testName, async function () {
      this.timeout(70000)

      testLogger.info('Send initial IPAFFS notification')
      this.docRef = await generateDocumentReference()
      this.mrn = generateRandomMRN()

      await sendIpaffsMessage(
        loadIPAFFSJson(`${testData.chedType}.json`, {
          version: 1,
          status: 'SUBMITTED',
          referenceNumber: this.docRef,
          lastUpdated: new Date().toISOString(),
          partTwo: {
            decision: {},
            inspectionRequired: 'Required'
          }
        })
      )

      await newClearanceRequest()
        .addItem({
          TaricCommodityCode: testData.TaricCommodityCode,
          Documents: Array.isArray(testData.Doccode)
            ? testData.Doccode.map((docCode) => ({
                DocumentCode: docCode,
                DocumentReference: this.docRef
              }))
            : [
                {
                  DocumentCode: testData.Doccode,
                  DocumentReference: this.docRef
                }
              ],
          Checks: testData.Checks
        })
        .withMRN(this.mrn)
        .withEntryVersionNumber(1)
        .sendClearanceRequest()
        .then(async (test) => {
          // Handle both single decision and array of decisions
          const decisions = Array.isArray(testData.submittedDecisions)
            ? testData.submittedDecisions
            : [testData.submittedDecisions]

          for (const decision of decisions) {
            await test.waitForCheckDecision(
              decision.checkCode,
              decision.decision
            )
          }
        })

      await sendIpaffsMessage(
        loadIPAFFSJson(`${testData.chedType}.json`, {
          referenceNumber: this.docRef,
          lastUpdated: new Date().toISOString(),
          version: 2,
          status: 'IN_PROGRESS',
          partTwo: {
            decision: {},
            inspectionRequired: 'Required'
          }
        })
      )
      await waitForDataInAPI(this.docRef, 'IPAFFS', {
        importPreNotification: { version: 2, status: 'IN_PROGRESS' }
      })

      // Handle both single decision and array of decisions for in-progress
      const inprogressDecisions = Array.isArray(testData.inprogressDecisions)
        ? testData.inprogressDecisions
        : [testData.inprogressDecisions]

      for (const decision of inprogressDecisions) {
        await waitForSpecificCheckDecision(
          this.mrn,
          decision.checkCode,
          decision.decision
        )
      }

      await sendIpaffsMessage(
        loadIPAFFSJson(`${testData.chedType}.json`, {
          referenceNumber: this.docRef,
          lastUpdated: new Date().toISOString(),
          ...testData.finalIpaffsPayload
        })
      )
      await waitForDataInAPI(this.docRef, 'IPAFFS', {
        importPreNotification: {
          version: testData.finalIpaffsPayload.version,
          status: testData.finalIpaffsPayload.status
        }
      })

      // Handle both single decision and array of decisions for final
      const finalDecisions = Array.isArray(testData.finalDecisions)
        ? testData.finalDecisions
        : [testData.finalDecisions]

      for (const decision of finalDecisions) {
        await waitForSpecificCheckDecision(
          this.mrn,
          decision.checkCode,
          decision.decision
        )
      }
    })
  })
})
