/**
 * Copyright 2019 AXA Group Operations S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { readFileSync } from 'fs';
import * as pdf from 'html-pdf';
import { simpleParser } from 'mailparser';
import { Document } from '../../types/DocumentRepresentation';
import logger from '../../utils/Logger';
import { Extractor } from '../Extractor';
import { getPdfExtractor } from './../../utils';

export class EmailExtractor extends Extractor {
  public async run(inputFile: string): Promise<Document> {

    const page = {
      width: '210mm',
      height: '297mm',
    };

    const styles = `
    <style>
    body, html {
      height: ${page.height} !important;
      width: ${page.width} !important;
    }
    table {
      width: 100% !important;
    }
  </style>
  `;
    try {
      const data = readFileSync(inputFile);
      const raw = await simpleParser(data);

      /*
       * the pdf.create function seems to generate a PDF with a slightly different page size.
       * For that reason is the scaling factor.
      */
      const scale = 1.36;
      const pdfFile = inputFile.replace('.eml', '.pdf');
      const pdfCreator = new Promise((resolve, reject) => {
        pdf.create(raw.html.concat(styles), {
          width: `${parseInt(page.width, 10) * scale}mm`,
          height: `${parseInt(page.height, 10) * scale}mm`,
          border: '2mm',
        }).toFile(pdfFile, (err) => {
          if (err) {
            logger.error(err);
            return reject(err);
          }
          return resolve(err);
        });
      });

      await pdfCreator;
      return getPdfExtractor(this.config).run(pdfFile);

    } catch (e) {
      // logger.error(e);
      throw e;
    }
  }
}
