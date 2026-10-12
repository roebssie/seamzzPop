# seamzzPop

An exploratory open-source project for turning garment inspiration into useful sewing-project starting points.

seamzzPop is intended to combine:

- garment recognition from user-uploaded images or permitted social-post links;
- discovery of relevant licensed, open, public-domain, or creator-authorized sewing patterns;
- parametric pattern drafting based on body measurements and garment preferences; and
- export of project files, including printable PDF pattern formats where appropriate.

## Project status

This repository is at the concept and foundation stage. Pattern recognition, pattern search, parametric drafting, and PDF generation are **not implemented yet**. Early work will focus on validating the user workflow, rights-aware content handling, measurement design, and safe technical foundations before attempting automated pattern generation.

## Product principles

1. **Inspiration is not ownership.** A public image or social-post link does not automatically grant permission to copy, download, transform, or redistribute a pattern or design.
2. **Assist, explain, and let the maker decide.** Outputs should expose assumptions, confidence, measurements, and construction notes rather than presenting an uncertain result as production-ready.
3. **Respect designers and platforms.** Discovery and ingestion must follow source terms, licenses, attribution requirements, and applicable API rules.
4. **Fit is personal.** Any measurement-based result needs clear calibration, testing guidance, and a path for manual adjustment.
5. **Start with a useful hybrid workflow.** Pattern discovery and editable drafting may deliver value before fully automated generation is feasible.

## Proposed user journey

1. Add a garment image or a link that the user is permitted to analyze.
2. Review the detected garment description and uncertainty notes.
3. Explore matching patterns and their license or source information.
4. Enter measurements and choose supported design options.
5. Adjust a draft or select a discovered pattern.
6. Export a clearly labelled project file or printable PDF after validation.

## Roadmap

### Phase 0 — Foundation

- Capture user needs through interviews and sewing-community feedback.
- Define licensing, attribution, privacy, and permitted-ingestion rules.
- Establish a domain model for garments, measurements, pattern pieces, sources, and exports.

### Phase 1 — Discovery prototype

- Build a small, rights-aware catalog of open or creator-authorized patterns.
- Support structured garment descriptions from manually reviewed examples.
- Rank patterns by explainable attributes such as silhouette, neckline, sleeve, and construction details.

### Phase 2 — Measurement and drafting foundations

- Define measurement capture and validation flows.
- Implement a constrained parametric garment model for one simple garment category.
- Add editable adjustments and a testable paper-tile export pipeline.

### Phase 3 — Assisted recognition

- Evaluate image-based garment attribute extraction on a carefully consented dataset.
- Show confidence and request user corrections.
- Connect recognized attributes to the rights-aware pattern catalog.

### Phase 4 — Export and learning loop

- Produce A4, A0, and projector-oriented exports where technically and legally appropriate.
- Add print calibration checks, seam-allowance controls, and assembly instructions.
- Collect opt-in feedback from makers and sewing educators.

## Non-goals for the first release

- Scraping social platforms or bypassing access controls.
- Reproducing commercial patterns without permission.
- Claiming that an image alone can guarantee a correct, well-fitting, production-ready pattern.
- Treating AI-generated output as a substitute for testing, fitting, or sewing expertise.

## Contributing

Early contributions are welcome, especially from sewists, pattern designers, educators, accessibility advocates, and engineers interested in computer vision, geometry, or document generation. Please open an issue before substantial implementation work so the scope and rights assumptions are clear.

## License

The starter code and documentation in this repository are released under the MIT License. Third-party patterns, images, datasets, trademarks, and generated outputs may have separate rights and terms; the repository license does not grant permission to use them.

See [LICENSE](LICENSE) for the full text.
